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
	ArticleID string `json:"article_id"`
}

func (cm *Comment) CommentList(c *gin.Context) {
	var req CommentListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}

	comments, total, err := models.GetArticleComments(req.ArticleID, req.CommentRequest)
	if err != nil {
		global.Log.Error("获取评论失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}

	res.SuccessWithPage(c, comments, int(total), req.CommentRequest.Page, req.CommentRequest.PageSize)
}
