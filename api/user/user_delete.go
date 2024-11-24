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
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}

	var user models.UserModel

	if err := global.DB.First(&user, req.ID).Error; err != nil {
		global.Log.Error("用户不存在", zap.Error(err))
		res.Fail(c, res.CodeUserNotExist)
		return
	}

	if err := user.Delete(); err != nil {
		global.Log.Error("删除用户失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}

	res.Success(c, nil)
}
