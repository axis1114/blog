package res

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	response(c, http.StatusOK, CodeSuccess, data, "")
}

// SuccessWithMsg 带消息的成功响应
func SuccessWithMsg(c *gin.Context, data interface{}, msg string) {
	response(c, http.StatusOK, CodeSuccess, data, msg)
}

// SuccessWithPage 分页成功响应
func SuccessWithPage[T any](c *gin.Context, list T, total, page, pageSize int) {
	pageData := PageResponse[T]{
		List:     list,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}
	Success(c, pageData)
}

// Fail 失败响应
func Fail(c *gin.Context, code ResCode) {
	response(c, http.StatusOK, code, nil, CodeMsg[code])
}

// FailWithMsg 带消息的失败响应
func FailWithMsg(c *gin.Context, code ResCode, msg string) {
	response(c, http.StatusOK, code, nil, msg)
}

// FailWithCode 带状态码的失败响应
func FailWithCode(c *gin.Context, httpStatus int, code ResCode) {
	response(c, httpStatus, code, nil, CodeMsg[code])
}

// response 统一响应处理
func response(c *gin.Context, httpStatus int, code ResCode, data interface{}, msg string) {
	if msg == "" {
		msg = CodeMsg[code]
	}

	c.JSON(httpStatus, Response{
		Code: int(code),
		Data: data,
		Msg:  msg,
	})
}
