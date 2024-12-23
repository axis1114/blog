package models

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"blog/global"

	"github.com/importcjj/sensitive"
	"github.com/microcosm-cc/bluemonday"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// CommentModel 评论模型，用于存储文章评论信息
type CommentModel struct {
	MODEL           `json:","`
	SubComments     []*CommentModel `json:"sub_comments" gorm:"foreignKey:ParentCommentID;constraint:OnDelete:CASCADE"`
	ParentCommentID *uint           `json:"parent_comment_id" gorm:"index:idx_parent_article"`
	Content         string          `json:"content"`                                    // 评论内容
	DiggCount       uint            `json:"digg_count"`                                 // 点赞数
	CommentCount    uint            `json:"comment_count"`                              // 子评论数
	ArticleID       string          `json:"article_id" gorm:"index:idx_parent_article"` // 关联的文章ID
	UserID          uint            `json:"user_id"`                                    // 评论用户ID
	User            UserModel       `json:"user" gorm:"foreignKey:UserID"`              // 关联的用户信息
}

type CommentRequest struct {
	PageInfo
	SortBy string `json:"sort_by" form:"sort_by" binding:"omitempty,oneof=created_at digg_count comment_count"`
}

const (
	CommentCacheKeyPrefix  = "comment:"
	CommentLimitKeyPrefix  = "comment_limit:"
	CommentCacheExpiration = 5 * time.Minute
	CommentCacheCleanup    = 10 * time.Minute
	CommentLimitPerMinute  = 3
	CommentMaxLength       = 1000
)

var (
	ErrEmptyContent          = errors.New("评论内容不能为空")
	ErrContentTooLong        = errors.New("评论内容不能超过1000字")
	ErrParentCommentNotExist = errors.New("父评论不存在")
)

// 在包级别定义变量
var (
	sensitiveFilter *sensitive.Filter
)

func init() {
	// 保留敏感词过滤器的初始化
	sensitiveFilter = sensitive.New()
	// 可以从配置文件加载敏感词
	// sensitiveFilter.LoadWordDict("path/to/sensitive_words.txt")

	// 如果没有敏感词文件，至少添加一些基本的敏感词
	//sensitiveFilter.AddWord("敏感词1", "敏感词2")
}

// GetArticleCommentsWithTree 优化版本
func GetArticleCommentsWithTree(articleID string) ([]*CommentModel, error) {
	// 1. 尝试从缓存获取
	cacheKey := fmt.Sprintf("%s:article:%s", CommentCacheKeyPrefix, articleID)
	if comments, err := getCommentsFromRedis(cacheKey); err == nil {
		return comments, nil
	}

	// 2. 缓存未命中，从数据库获取
	var allComments []*CommentModel
	if err := global.DB.Model(&CommentModel{}).
		Where("article_id = ?", articleID).
		Preload("User").
		Order("created_at DESC").
		Find(&allComments).Error; err != nil {
		return nil, fmt.Errorf("获取评论失败: %w", err)
	}

	// 3. 构建评论树
	rootComments := buildCommentTree(allComments)

	// 4. 存入缓存
	go func() {
		if err := cacheCommentsToRedis(cacheKey, rootComments); err != nil {
			global.Log.Error("缓存评论失败", zap.Error(err))
		}
	}()

	return rootComments, nil
}

// buildCommentTree 将评论列表构建成树形结构
func buildCommentTree(allComments []*CommentModel) []*CommentModel {
	commentMap := make(map[uint]*CommentModel)
	var rootComments []*CommentModel

	// 1. 建立映射关系
	for _, comment := range allComments {
		commentMap[comment.ID] = comment
	}

	// 2. 构建树形结构
	for _, comment := range allComments {
		if comment.ParentCommentID == nil {
			rootComments = append(rootComments, comment)
		} else {
			if parent, exists := commentMap[*comment.ParentCommentID]; exists {
				parent.SubComments = append(parent.SubComments, comment)
			}
		}
	}

	return rootComments
}

// CreateComment 优化版本
func CreateComment(comment *CommentModel) error {
	// 1. 评论内容验证和过滤
	if err := validateAndFilterComment(comment); err != nil {
		return fmt.Errorf("评论验证失败: %w", err)
	}

	// 2. 评论频率限制检查
	if err := canUserComment(comment.UserID); err != nil {
		return fmt.Errorf("评论频率限制: %w", err)
	}

	// 3. 事务处理
	err := global.DB.Transaction(func(tx *gorm.DB) error {
		// 检查父评论是否存在
		if comment.ParentCommentID != nil {
			if err := checkParentComment(tx, *comment.ParentCommentID); err != nil {
				return err
			}
		}

		// 创建评论
		if err := tx.Create(comment).Error; err != nil {
			return fmt.Errorf("创建评论失败: %w", err)
		}

		// 更新父评论的评论计数
		if comment.ParentCommentID != nil {
			if err := updateParentCommentCount(tx, *comment.ParentCommentID); err != nil {
				return err
			}
		}

		return nil
	})

	// 4. 异步清除缓存
	if err == nil {
		go clearCommentCache(comment.ArticleID)
	}

	return err
}

// 新增的辅助函数
func checkParentComment(tx *gorm.DB, parentID uint) error {
	var exists bool
	err := tx.Model(&CommentModel{}).
		Select("1").
		Where("id = ?", parentID).
		First(&exists).Error
	if err != nil {
		return ErrParentCommentNotExist
	}
	return nil
}

func updateParentCommentCount(tx *gorm.DB, parentID uint) error {
	return tx.Model(&CommentModel{}).
		Where("id = ?", parentID).
		UpdateColumn("comment_count", gorm.Expr("comment_count + ?", 1)).
		Error
}

func clearCommentCache(articleID string) {
	if err := clearArticleCommentsCache(articleID); err != nil {
		global.Log.Error("清除评论缓存失败",
			zap.String("article_id", articleID),
			zap.Error(err))
	}
}

func validateComment(comment *CommentModel) error {
	content := strings.TrimSpace(comment.Content)
	if content == "" {
		return ErrEmptyContent
	}
	if len(content) > CommentMaxLength {
		return ErrContentTooLong
	}

	if comment.ParentCommentID != nil {
		exists, err := existsComment(*comment.ParentCommentID)
		if err != nil {
			return fmt.Errorf("检查父评论失败: %w", err)
		}
		if !exists {
			return ErrParentCommentNotExist
		}
	}
	return nil
}

func existsComment(commentID uint) (bool, error) {
	var count int64
	err := global.DB.Model(&CommentModel{}).Where("id = ?", commentID).Count(&count).Error
	return count > 0, err
}

func filterContent(content string) (string, error) {
	if sensitiveFilter == nil {
		// 如果过滤器未初始化，至少返回清理后的HTML
		return bluemonday.UGCPolicy().Sanitize(content), nil
	}

	// 清理HTML
	content = bluemonday.UGCPolicy().Sanitize(content)
	// 过滤敏感词
	content = sensitiveFilter.Replace(content, '*')
	return content, nil
}

func UpdateCommentCount(commentID uint) error {
	var count int64
	if err := global.DB.Model(&CommentModel{}).Where("parent_comment_id = ?", commentID).Count(&count).Error; err != nil {
		return err
	}
	return global.DB.Model(&CommentModel{}).Where("id = ?", commentID).Update("comment_count", count).Error
}

func DeleteComment(commentID uint) error {
	var comment CommentModel
	if err := global.DB.First(&comment, commentID).Error; err != nil {
		return err
	}

	err := global.DB.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		updates := map[string]interface{}{"deleted_at": now}

		if err := tx.Model(&CommentModel{}).
			Where("id = ? OR parent_comment_id = ?", commentID, commentID).
			Updates(updates).Error; err != nil {
			return err
		}
		return nil
	})

	if err == nil {
		// 删除评论成功后清除缓存
		if err := clearArticleCommentsCache(comment.ArticleID); err != nil {
			global.Log.Error("清除评论缓存失败", zap.Error(err))
		}
	}

	return err
}

func GetCommentsByUserID(userID uint, req CommentRequest) ([]*CommentModel, int64, error) {
	var total int64
	var comments []*CommentModel

	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 10
	}

	offset := (req.Page - 1) * req.PageSize

	query := global.DB.Model(&CommentModel{}).
		Preload("User").
		Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.
		Order("created_at DESC").
		Offset(offset).
		Limit(req.PageSize).
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

func canUserComment(userID uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("%s%d", CommentLimitKeyPrefix, userID)

	// 使用 Redis INCR 命令增加计数
	count, err := global.Redis.Incr(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("检查评论限制失败: %w", err)
	}

	// 如果是第一次评论，设置过期时间
	if count == 1 {
		global.Redis.Expire(ctx, key, time.Second*10)
	}

	if count > CommentLimitPerMinute {
		return errors.New("评论太频繁，请稍后再试")
	}

	return nil
}

func validateAndFilterComment(comment *CommentModel) error {
	if err := validateComment(comment); err != nil {
		return err
	}

	filteredContent, err := filterContent(comment.Content)
	if err != nil {
		return err
	}
	comment.Content = filteredContent
	return nil
}

// 从Redis获取评论缓存
func getCommentsFromRedis(key string) ([]*CommentModel, error) {
	ctx := context.Background()
	data, err := global.Redis.Get(ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	var comments []*CommentModel
	if err := json.Unmarshal(data, &comments); err != nil {
		return nil, err
	}

	return comments, nil
}

// 将评论缓存到Redis
func cacheCommentsToRedis(key string, comments []*CommentModel) error {
	ctx := context.Background()
	data, err := json.Marshal(comments)
	if err != nil {
		return err
	}

	return global.Redis.Set(ctx, key, data, CommentCacheExpiration).Err()
}

// 清除文章评论缓存
func clearArticleCommentsCache(articleID string) error {
	ctx := context.Background()
	key := fmt.Sprintf("%s:article:%s", CommentCacheKeyPrefix, articleID)
	return global.Redis.Del(ctx, key).Err()
}
