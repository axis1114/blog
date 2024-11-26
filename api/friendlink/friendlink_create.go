package friendlink

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type FriendLinkCreate struct {
	Name string `json:"name"`
	Link string `json:"link"`
}

func (f *FriendLink) FriendLinkCreate(c *gin.Context) {
	var req FriendLinkCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	err := (&models.FriendLinkModel{
		Name: req.Name,
		Link: req.Link,
	}).Create()
	if err != nil {
		global.Log.Error("友链创建失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
