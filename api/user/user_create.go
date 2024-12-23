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
		global.Log.Error("c.ShouldBindJSON failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	account, err := utils.GenerateID()
	if err != nil {
		global.Log.Error("utils.GenerateID() failed", zap.Error(err))
		res.Error(c, res.ServerError, "生成ID失败")
		return
	}
	err = (&models.UserModel{
		Account:  strconv.FormatInt(account, 10),
		Nickname: req.Nickname,
		Password: req.Password,
		Role:     req.Role,
	}).Create(c.ClientIP())
	if err != nil {
		global.Log.Error("user.Create() failed", zap.Error(err))
		res.Error(c, res.ServerError, "用户创建失败")
		return
	}
	res.Success(c, account)
}
