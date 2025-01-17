package user

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (u *User) UserDelete(c *gin.Context) {
	var req models.IDRequest
	if err := c.ShouldBindUri(&req); err != nil {
		global.Log.Error("c.ShouldBindUri() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}

	var user models.UserModel

	if err := global.DB.First(&user, req.ID).Error; err != nil {
		global.Log.Error("global.DB.First() failed", zap.Error(err))
		res.Error(c, res.NotFound, "用户不存在")
		return
	}

	if err := user.Delete(); err != nil {
		global.Log.Error("user.Delete() failed", zap.Error(err))
		res.Error(c, res.ServerError, "删除用户失败")
		return
	}

	res.Success(c, nil)
}
