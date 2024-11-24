package models

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"blog/global"

	"github.com/importcjj/sensitive"
	"github.com/microcosm-cc/bluemonday"
	"github.com/patrickmn/go-cache"
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

func (req *CommentRequest) normalize() {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 10
	}
}

func (req *CommentRequest) getOffset() int {
	return (req.Page - 1) * req.PageSize
}

func GetArticleComments(articleID string, req CommentRequest) ([]*CommentModel, int64, error) {
	cacheKey := fmt.Sprintf("article_comments:%s", articleID)

	if comments, ok := getFromCache(cacheKey); ok {
		return comments, 0, nil
	}

	query := global.DB.Model(&CommentModel{}).
		Preload("User").
		Where("article_id = ? AND parent_comment_id IS NULL", articleID)

	comments, total, err := executeCommentQuery(query, req)
	if err != nil {
		return nil, 0, err
	}

	// 构建评论树并缓存
	result := buildCommentTree(comments)
	commentCache.Set(cacheKey, result, CommentCacheExpiration)
	return result, total, nil
}

func buildCommentTree(comments []*CommentModel) []*CommentModel {
	commentMap := make(map[uint]*CommentModel)
	var rootComments []*CommentModel

	// 建立查找映射
	for _, comment := range comments {
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

	return global.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(comment).Error; err != nil {
			return err
		}
		return updateParentCommentCount(tx, comment.ParentCommentID)
	})
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
	content = bluemonday.UGCPolicy().Sanitize(content)
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
	return global.DB.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		updates := map[string]interface{}{"deleted_at": now}

		// 同时删除主评论和子评论
		if err := tx.Model(&CommentModel{}).
			Where("id = ? OR parent_comment_id = ?", commentID, commentID).
			Updates(updates).Error; err != nil {
			return err
		}
		return nil
	})
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
	key := fmt.Sprintf("comment_limit:%d", userID)
	count, found := commentCache.Get(key)

	if !found {
		commentCache.Set(key, 1, time.Minute)
		return nil
	}

	if count.(int) >= CommentLimitPerMinute {
		return errors.New("评论太频繁，请稍后再试")
	}

	commentCache.Set(key, count.(int)+1, time.Minute)
	return nil
}

var commentCache *cache.Cache
var sensitiveFilter *sensitive.Filter

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

func updateParentCommentCount(tx *gorm.DB, parentCommentID *uint) error {
	if parentCommentID != nil {
		if err := UpdateCommentCount(*parentCommentID); err != nil {
			return err
		}
	}
	return nil
}

func getFromCache(cacheKey string) ([]*CommentModel, bool) {
	if cached, found := commentCache.Get(cacheKey); found {
		if cachedComments, ok := cached.([]*CommentModel); ok {
			return cachedComments, true
		}
	}
	return nil, false
}

func executeCommentQuery(query *gorm.DB, req CommentRequest) ([]*CommentModel, int64, error) {
	var total int64
	orderBy := "created_at DESC"
	if req.SortBy != "" {
		orderBy = fmt.Sprintf("%s DESC", req.SortBy)
	}

	var comments []*CommentModel
	if err := query.
		Order(orderBy).
		Offset((req.Page - 1) * req.PageSize).
		Limit(req.PageSize).
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}
