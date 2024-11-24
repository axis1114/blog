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
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}

	if err := models.DeleteComment(uint(req.ID)); err != nil {
		global.Log.Error("删除评论失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}

	res.Success(c, nil)
}
