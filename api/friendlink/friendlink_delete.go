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
		global.Log.Error("c.ShouldBindUri() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	err := (&models.FriendLinkModel{
		MODEL: models.MODEL{
			ID: req.ID,
		},
	}).Delete()
	if err != nil {
		global.Log.Error("friendlink.Delete() failed", zap.Error(err))
		res.Error(c, res.ServerError, "友链删除失败")
		return
	}
	res.Success(c, nil)
}
