package user

import (
	"context"
	"strconv"
	"time"

	"blog/api/system"
	"blog/global"
	"blog/models"
	"blog/models/res"
	redis_ser "blog/service/redis"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserLoginRequest struct {
	Account   string `json:"account"`
	Password  string `json:"password"`
	Captcha   string `json:"captcha"`
	CaptchaId string `json:"captcha_id"`
}

func (u *User) UserLogin(c *gin.Context) {
	var req UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		global.Log.Error("utils.ShouldBindJSON() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}

	if global.Config.Captcha.Open {
		if req.Captcha == "" || req.CaptchaId == "" || !system.Store.Verify(req.CaptchaId, req.Captcha, true) {
			res.Error(c, res.InvalidParameter, "验证码错误")
			return
		}
	}

	var user models.UserModel
	err := user.FindByAccount(req.Account)
	if err != nil {
		res.Error(c, res.UserNotFound, "用户名或密码错误")
		return
	}

	if !utils.CheckPassword(user.Password, req.Password) {
		res.Error(c, res.PasswordError, "用户名或密码错误")
		return
	}

	userPayload := utils.PayLoad{
		Account: req.Account,
		Role:    user.Role,
		UserID:  user.ID,
	}
	accessToken, err := utils.GenerateAccessToken(userPayload)
	if err != nil {
		global.Log.Error("utils.GenerateAccessToken() failed", zap.Error(err))
		res.Error(c, res.ServerError, "生成access token失败")
		return
	}

	err = user.UpdateToken(accessToken)
	if err != nil {
		global.Log.Error("user.UpdateToken() failed", zap.Error(err))
		res.Error(c, res.ServerError, "更新用户token失败")
		return
	}

	c.Request.Header.Set("Authorization", "Bearer "+accessToken)

	refreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		global.Log.Error("utils.GenerateRefreshToken() failed", zap.Error(err))
		res.Error(c, res.ServerError, "生成refresh token失败")
		return
	}
	expiration := time.Duration(global.Config.Jwt.Expires) * 24 * time.Hour
	key := redis_ser.RefreshToken + strconv.Itoa(int(user.ID))
	err = global.Redis.Set(context.Background(), redis_ser.GetRedisKey(key), refreshToken, expiration).Err()
	if err != nil {
		global.Log.Error("global.Redis.Set() failed", zap.Error(err))
		res.Error(c, res.ServerError, "设置 refresh token 到 redis 失败")
		return
	}
	res.Success(c, accessToken)
}
