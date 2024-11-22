package res

type ResCode int

const (
	// 成功码
	CodeSuccess ResCode = 2000

	// 客户端错误码 (4000-4999)
	CodeBadRequest     ResCode = 4000
	CodeUnauthorized   ResCode = 4001
	CodeForbidden      ResCode = 4003
	CodeNotFound       ResCode = 4004
	CodeValidationFail ResCode = 4422

	// 服务端错误码 (5000-5999)
	CodeInternalError ResCode = 5000
	CodeDBError       ResCode = 5001
	CodeCacheError    ResCode = 5002

	// 业务错误码 (6000-6999)
	CodeUserExist     ResCode = 6001
	CodeUserNotExist  ResCode = 6002
	CodePasswordError ResCode = 6003
	CodeTokenExpired  ResCode = 6004
	CodeTokenInvalid  ResCode = 6005
)

// CodeMsg 错误码消息映射
var CodeMsg = map[ResCode]string{
	CodeSuccess:        "操作成功",
	CodeBadRequest:     "请求参数错误",
	CodeUnauthorized:   "未授权访问",
	CodeForbidden:      "禁止访问",
	CodeNotFound:       "资源不存在",
	CodeValidationFail: "数据验证失败",
	CodeInternalError:  "服务器内部错误",
	CodeDBError:        "数据库操作失败",
	CodeCacheError:     "缓存操作失败",
	CodeUserExist:      "用户已存在",
	CodeUserNotExist:   "用户不存在",
	CodePasswordError:  "密码错误",
	CodeTokenExpired:   "令牌已过期",
	CodeTokenInvalid:   "令牌无效",
}
