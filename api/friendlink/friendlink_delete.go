package friendlink

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (f *FriendLink) FriendLinkDelete(c *gin.Context) {
	var req models.IDRequest
	if err := c.ShouldBindUri(&req); err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	err := (&models.FriendLinkModel{
		MODEL: models.MODEL{
			ID: req.ID,
		},
	}).Delete()
	if err != nil {
		global.Log.Error("友链删除失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
