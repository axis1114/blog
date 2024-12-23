package middleware

import (
	"blog/global"
	"blog/models/ctypes"
	"blog/models/res"
	"blog/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// JwtAuth 中间件，负责验证 Token 并将用户信息存储到上下文
func JwtAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Request.Header.Get("Authorization")
		// 检查 Token 是否存在并去除 "Bearer " 前缀
		if len(tokenString) < 7 || tokenString[:7] != "Bearer " {
			res.HttpError(c, http.StatusUnauthorized, res.TokenMissing, "缺少token")
			c.Abort()
			return
		}
		tokenString = tokenString[7:]
		// 解析 Token
		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			if err.Error() == "token已过期" && claims != nil {
				// Token 已过期，尝试刷新
				newAccessToken, refreshErr := utils.RefreshAccessToken(tokenString, claims.UserID)
				if refreshErr != nil || newAccessToken == "" {
					global.Log.Error("utils.RefreshAccessToken failed", zap.Error(refreshErr))
					res.HttpError(c, http.StatusUnauthorized, res.TokenExpired, "token已过期")
					c.Abort()
					return
				}
				// 刷新成功，将新的 Token 设置到响应头中
				c.Request.Header.Set("Authorization", "Bearer "+newAccessToken)
				c.Set("claims", claims)
				c.Next()
				return
			}
			res.HttpError(c, http.StatusUnauthorized, res.TokenInvalid, "token无效")
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
			res.HttpError(c, http.StatusForbidden, res.PermissionDenied, "权限不足")
			c.Abort()
			return
		}

		c.Next()
	}
}
