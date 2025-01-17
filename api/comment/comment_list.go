package comment

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CommentListRequest struct {
	models.CommentRequest
	ArticleID string `form:"article_id"`
}

func (cm *Comment) CommentList(c *gin.Context) {
	var req CommentListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		global.Log.Error("c.ShouldBindQuery() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}

	comments, err := models.GetArticleCommentsWithTree(req.ArticleID)
	if err != nil {
		global.Log.Error("comment.GetArticleCommentsWithTree() failed", zap.Error(err))
		res.Error(c, res.ServerError, "获取评论失败")
		return
	}

	res.Success(c, comments)
}
