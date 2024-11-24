package user

import (
	"blog/models/ctypes"
	"strconv"

	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserCreateRequest struct {
	Nickname string          `json:"nick_name"`
	Password string          `json:"password"`
	Role     ctypes.UserRole `json:"role"`
}

func (u *User) UserCreate(c *gin.Context) {
	var req UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	account, err := utils.GenerateID()
	if err != nil {
		global.Log.Error("生成ID失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	err = (&models.UserModel{
		Account:  strconv.FormatInt(account, 10),
		Nickname: req.Nickname,
		Password: req.Password,
		Role:     req.Role,
	}).Create(c.ClientIP())
	if err != nil {
		global.Log.Error("用户创建失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, account)
}
