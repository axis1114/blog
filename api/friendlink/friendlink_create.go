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
		global.Log.Error("c.ShouldBindJSON failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	err := (&models.FriendLinkModel{
		Name: req.Name,
		Link: req.Link,
	}).Create()
	if err != nil {
		global.Log.Error("friendlink.Create() failed", zap.Error(err))
		res.Error(c, res.ServerError, "友链创建失败")
		return
	}
	res.Success(c, nil)
}
