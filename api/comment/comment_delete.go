package comment

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (cm *Comment) CommentDelete(c *gin.Context) {
	var req models.IDRequest
	if err := c.ShouldBindUri(&req); err != nil {
		global.Log.Error("c.ShouldBindUri() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}

	if err := models.DeleteComment(uint(req.ID)); err != nil {
		global.Log.Error("comment.DeleteComment() failed", zap.Error(err))
		res.Error(c, res.ServerError, "删除评论失败")
		return
	}

	res.Success(c, nil)
}
