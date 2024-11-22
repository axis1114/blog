package system

import (
	"blog/global"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"github.com/mojocn/base64Captcha"
	"go.uber.org/zap"
)

var Store = base64Captcha.DefaultMemStore

type CaptchaResponse struct {
	CaptchaID string `json:"captcha_id"`
	PicPath   string `json:"pic_path"`
}

// CaptchaCreate  验证码生成
// @Summary 验证码生成
// @Router /api/captcha [get]
// @Produce json
// @Success 200 {object} res.Response{data=CaptchaResponse}
func (s *System) CaptchaCreate(c *gin.Context) {
	driver := base64Captcha.NewDriverDigit(
		global.Config.Captcha.ImgHeight,
		global.Config.Captcha.ImgWidth,
		global.Config.Captcha.KeyLong,
		0.7,
		70,
	)
	captcha := base64Captcha.NewCaptcha(driver, Store)
	id, b64s, _, err := captcha.Generate()
	if err != nil {
		global.Log.Error("验证码生成失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, CaptchaResponse{
		CaptchaID: id,
		PicPath:   b64s,
	})
}
