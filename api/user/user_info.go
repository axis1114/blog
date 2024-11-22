package user

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (u *User) Userinfo(c *gin.Context) {
	var user models.UserModel
	_claims, _ := c.Get("claims")
	claims := _claims.(*utils.CustomClaims)
	if err := global.DB.First(&user, claims.UserID).Error; err != nil {
		global.Log.Error("获取用户信息失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, user)
}
