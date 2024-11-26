package friendlink

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/service/search"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (f *FriendLink) FriendLinkList(c *gin.Context) {
	var req models.PageInfo
	if err := c.ShouldBindQuery(&req); err != nil {
		global.Log.Error("参数校验失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	list, count, err := search.ComList(models.FriendLinkModel{}, search.Option{
		PageInfo: req,
	})
	if err != nil {
		global.Log.Error("加载失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.SuccessWithPage(c, list, int(count), req.Page, req.PageSize)
}
