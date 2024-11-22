package middleware

import (
	"blog/global"
	"blog/models/ctypes"
	"blog/models/res"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// JwtAuth 中间件，负责验证 Token 并将用户信息存储到上下文
func JwtAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Request.Header.Get("Authorization")
		// 检查 Token 是否存在并去除 "Bearer " 前缀
		if len(tokenString) < 7 || tokenString[:7] != "Bearer " {
			res.Fail(c, res.CodeUnauthorized)
			c.Abort()
			return
		}
		tokenString = tokenString[7:]
		// 解析 Token
		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			if err.Error() == "token is expired" {
				// Token 已过期，尝试刷新
				newAccessToken, refreshErr := utils.RefreshAccessToken(tokenString, claims.UserID)
				if refreshErr != nil || newAccessToken == "" {
					global.Log.Error("token刷新失败", zap.Error(refreshErr))
					res.Fail(c, res.CodeTokenExpired)
					c.Abort()
					return
				}
				// 刷新成功，将新的 Token 设置到响应头中

				c.Request.Header.Set("Authorization", "Bearer "+newAccessToken)
				c.Set("claims", claims)
				c.Next()
				return
			}
			res.Fail(c, res.CodeTokenInvalid)
			c.Abort()
			return
		}

		// 将用户信息保存到上下文中，方便后续使用
		c.Set("claims", claims)

		c.Next()
	}
}

// JwtAdmin 中间件，基于 JwtAuth 并检查用户角色
func JwtAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 先执行 JwtAuth 中间件的验证
		JwtAuth()(c)
		if c.IsAborted() {
			return // 如果 JwtAuth 验证失败，直接中止
		}

		// 验证用户角色是否为管理员
		_claims, _ := c.Get("claims")
		claims := _claims.(*utils.CustomClaims)
		if claims.Role != ctypes.RoleAdmin {
			res.Fail(c, res.CodeForbidden)
			c.Abort()
			return
		}

		c.Next()
	}
}
