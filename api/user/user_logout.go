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
		global.Log.Error("缺少token")
		res.Error(c, res.TokenMissing, "缺少token")
		return
	}
	accessToken = accessToken[7:]

	claims, err := utils.ParseToken(accessToken)
	if err != nil {
		global.Log.Error("utils.ParseToken() failed", zap.Error(err))
		res.Error(c, res.TokenInvalid, "token无效")
		return
	}
	key := redis_ser.RefreshToken + strconv.Itoa(int(claims.UserID))
	err = global.Redis.Del(context.Background(), redis_ser.GetRedisKey(key)).Err()
	if err != nil {
		global.Log.Error("global.Redis.Del() failed", zap.Error(err))
		res.Error(c, res.ServerError, "删除redis中的refresh token失败")
		return
	}
	res.Success(c, nil)
}
