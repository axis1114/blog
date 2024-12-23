package utils

import (
	"fmt"
	"reflect"
	"strings"

	"blog/global"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/locales/en"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	enTranslations "github.com/go-playground/validator/v10/translations/en"
	zhTranslations "github.com/go-playground/validator/v10/translations/zh"
	"go.uber.org/zap"
)

// Translator 定义全局翻译器
var trans ut.Translator

// InitTrans 初始化验证器翻译器
func InitTrans(locale string) error {
	// 获取gin验证器引擎
	v, ok := binding.Validator.Engine().(*validator.Validate)
	if !ok {
		return fmt.Errorf("获取验证器引擎失败")
	}

	// 初始化翻译器
	zhT := zh.New()
	enT := en.New()
	uni := ut.New(enT, zhT)

	// 获取指定语言的翻译器
	var exists bool
	if trans, exists = uni.GetTranslator(locale); !exists {
		return fmt.Errorf("获取翻译器失败: locale=%s", locale)
	}

	// 注册翻译器并处理错误
	var err error
	switch locale {
	case "zh":
		err = zhTranslations.RegisterDefaultTranslations(v, trans)
	case "en":
		err = enTranslations.RegisterDefaultTranslations(v, trans)
	default:
		err = enTranslations.RegisterDefaultTranslations(v, trans)
		global.Log.Warn("使用默认英语翻译器", zap.String("locale", locale))
	}

	if err != nil {
		return fmt.Errorf("注册翻译器失败: %v", err)
	}

	// 注册一个函数，获取struct tag中的字段别名作为字段名
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return fld.Name
		}
		return name
	})

	return nil
}

// Translate 翻译错误信息
func Translate(err error) string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		return validationErrors[0].Translate(trans)
	}
	return err.Error()
}

var validate = validator.New()

func Validate(i interface{}) error {
	return validate.Struct(i)
}
