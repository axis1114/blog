package res

type Response struct {
	Code int         `json:"code"` // 业务码
	Data interface{} `json:"data"` // 数据
	Msg  string      `json:"msg"`  // 消息
}

type PageResponse[T any] struct {
	List     T   `json:"list"`      // 数据列表
	Total    int `json:"total"`     // 总数
	Page     int `json:"page"`      // 当前页
	PageSize int `json:"page_size"` // 每页大小
}
