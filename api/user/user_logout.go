package user

import (
	"context"
	"strconv"

	"blog/global"
	"blog/models/res"
	redis_ser "blog/service/redis"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (u *User) UserLogout(c *gin.Context) {
	accessToken := c.GetHeader("Authorization")

	if len(accessToken) < 7 || accessToken[:7] != "Bearer " {
		global.Log.Error("token为空")
		res.Fail(c, res.CodeUnauthorized)
		return
	}
	accessToken = accessToken[7:]

	claims, err := utils.ParseToken(accessToken)
	if err != nil {
		global.Log.Error("解析access token失败", zap.Error(err))
		res.Fail(c, res.CodeTokenInvalid)
		return
	}
	key := redis_ser.RefreshToken + strconv.Itoa(int(claims.UserID))
	err = global.Redis.Del(context.Background(), redis_ser.GetRedisKey(key)).Err()
	if err != nil {
		global.Log.Error("删除 redis 中的 refresh token 失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
