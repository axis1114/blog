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

type CommentModel struct {
	MODEL           `json:","`
	SubComments     []*CommentModel `json:"sub_comments" gorm:"foreignKey:ParentCommentID;constraint:OnDelete:CASCADE"`
	ParentCommentID *uint           `json:"parent_comment_id" gorm:"index:idx_parent_article"`
	Content         string          `json:"content"`
	DiggCount       uint            `json:"digg_count"`
	CommentCount    uint            `json:"comment_count"`
	ArticleID       string          `json:"article_id" gorm:"index:idx_parent_article"`
	UserID          uint            `json:"user_id"`
	User            UserModel       `json:"user" gorm:"foreignKey:UserID"`
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

func GetArticleComments(articleID string) ([]*CommentModel, error) {
	cacheKey := fmt.Sprintf("%s:article:%s", CommentCacheKeyPrefix, articleID)

	// 尝试从Redis获取缓存
	rediscomments, err := getCommentsFromRedis(cacheKey)
	if err == nil {
		return rediscomments, nil
	}

	// 缓存未命中,从数据库查询
	var comments []*CommentModel
	if err := global.DB.Model(&CommentModel{}).
		Where("article_id = ?", articleID).
		Preload("User").
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		return nil, err
	}

	// 构建评论树
	result := buildCommentTree(comments)

	// 缓存到Redis
	if err := cacheCommentsToRedis(cacheKey, result); err != nil {
		global.Log.Error("缓存评论失败", zap.Error(err))
	}

	return result, nil
}

func buildCommentTree(comments []*CommentModel) []*CommentModel {
	commentMap := make(map[uint]*CommentModel)
	var rootComments []*CommentModel

	// 建立查找映射
	for _, comment := range comments {
		// 确保 SubComments 为空，避免重复
		comment.SubComments = []*CommentModel{}
		commentMap[comment.ID] = comment
	}

	// 构建父子关系
	for _, comment := range comments {
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

func GetAllSubComments(commentID uint) ([]CommentModel, error) {
	var allComments []CommentModel
	if err := global.DB.Preload("User").Where("parent_comment_id = ?", commentID).Find(&allComments).Error; err != nil {
		return nil, err
	}
	return allComments, nil
}

func CreateComment(comment *CommentModel) error {
	if err := validateAndFilterComment(comment); err != nil {
		return err
	}

	err := canUserComment(comment.UserID)
	if err != nil {
		return err
	}

	err = global.DB.Transaction(func(tx *gorm.DB) error {
		if comment.ParentCommentID != nil {
			var parentComment CommentModel
			if err := tx.Set("gorm:query_option", "FOR UPDATE SKIP LOCKED").
				First(&parentComment, *comment.ParentCommentID).Error; err != nil {
				return err
			}
		}

		if err := tx.Create(comment).Error; err != nil {
			return err
		}

		if comment.ParentCommentID != nil {
			return tx.Model(&CommentModel{}).
				Where("id = ?", *comment.ParentCommentID).
				UpdateColumn("comment_count", gorm.Expr("comment_count + ?", 1)).
				Error
		}
		return nil
	})

	if err == nil {
		go func() {
			if err := clearArticleCommentsCache(comment.ArticleID); err != nil {
				global.Log.Error("清除评论缓存失败", zap.Error(err))
			}
		}()
	}

	return err
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
