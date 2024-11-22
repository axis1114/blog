package utils

import (
	"blog/models/ctypes"
	"errors"
	"time"

	"blog/global"

	"github.com/dgrijalva/jwt-go"
	"go.uber.org/zap"
)

type PayLoad struct {
	Account string          `json:"account"`
	Role    ctypes.UserRole `json:"role"`
	UserID  uint            `json:"user_id"`
}

type CustomClaims struct {
	PayLoad
	jwt.StandardClaims
}

type RefreshClaims struct {
	UserID uint `json:"user_id"`
	jwt.StandardClaims
}

// GenerateAccessToken 生成 Access Token
func GenerateAccessToken(payload PayLoad) (string, error) {
	claims := CustomClaims{
		PayLoad: payload,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(5 * time.Minute).Unix(),
			Issuer:    global.Config.Jwt.Issuer,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(global.Config.Jwt.Secret))
}

// GenerateRefreshToken 生成 Refresh Token
func GenerateRefreshToken(userID uint) (string, error) {
	claims := RefreshClaims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Duration(global.Config.Jwt.Expires) * 24 * time.Hour).Unix(),
			Issuer:    global.Config.Jwt.Issuer,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(global.Config.Jwt.Secret))
}

// ParseToken 解析  Token
func ParseToken(tokenString string) (*CustomClaims, error) {
	var claims CustomClaims
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.Config.Jwt.Secret), nil
	})
	if err != nil {
		return &claims, errors.New("token is expired")
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return &claims, nil
}

// RefreshToken 刷新 AccessToken 和 RefreshToken
func RefreshToken(aToken, rToken string) (newAToken, newRToken string, err error) {
	// 解析并验证 Refresh Token
	var rClaims RefreshClaims
	token, err := jwt.ParseWithClaims(rToken, &rClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.Config.Jwt.Secret), nil
	})

	if err != nil || !token.Valid {
		global.Log.Error("jwt.ParseWithClaims出现错误", zap.Error(err))
		return "", "", errors.New("invalid token")
	}

	// 检查 Refresh Token 是否即将过期
	refreshThreshold := time.Duration(global.Config.Jwt.RefreshThreshold) * 24 * time.Hour
	if time.Until(time.Unix(rClaims.ExpiresAt, 0)) < refreshThreshold {
		newRToken, err = GenerateRefreshToken(rClaims.UserID)
		if err != nil {
			global.Log.Error("GenerateRefreshToken出现错误", zap.Error(err))
			return "", "", errors.New("failed to refresh token")
		}
	} else {
		newRToken = rToken
	}

	// 解析并验证 Access Token，若无效则生成新 Access Token
	var aClaims CustomClaims
	_, err = jwt.ParseWithClaims(aToken, &aClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.Config.Jwt.Secret), nil
	})
	if err != nil {
		if vErr, ok := err.(*jwt.ValidationError); ok && vErr.Errors&jwt.ValidationErrorExpired != 0 {
			// Access Token 已过期，生成新的 Access Token
			newAToken, err = GenerateAccessToken(PayLoad{
				UserID:  aClaims.UserID,
				Account: aClaims.Account,
				Role:    aClaims.Role,
			})
			if err != nil {
				global.Log.Error("GenerateAccessToken出现错误", zap.Error(err))
				return "", "", errors.New("failed to refresh token")
			}
			return newAToken, newRToken, nil
		}
		global.Log.Error("jwt.ParseWithClaims出现错误", zap.Error(err))
		return "", "", errors.New("invalid token")
	}

	// Access Token 仍然有效，返回原 Token
	return aToken, newRToken, nil
}
