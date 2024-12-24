﻿package comment

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CommentCreateRequest struct {
	Content         string `json:"content"`
	ArticleID       string `json:"article_id"`
	ParentCommentID *uint  `json:"parent_comment_id,omitempty"`
}

func (cm *Comment) CommentCreate(c *gin.Context) {
	_claims, _ := c.Get("claims")
	claims := _claims.(*utils.CustomClaims)
	var req CommentCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		global.Log.Error("c.ShouldBindJSON failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}

	comment := &models.CommentModel{
		Content:         req.Content,
		ArticleID:       req.ArticleID,
		UserID:          claims.UserID,
		ParentCommentID: req.ParentCommentID,
	}

	// 4. 创建评论
	if err := models.CreateComment(comment); err != nil {
		global.Log.Error("comment.CreateComment() failed", zap.Error(err))
		res.Error(c, res.ServerError, "创建评论失败")
		return
	}

	res.Success(c, nil)
}