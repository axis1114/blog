package image

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/service/search"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (i *Image) ImageList(c *gin.Context) {
	var req models.PageInfo
	err := c.ShouldBindQuery(&req)
	if err != nil {
		global.Log.Error("c.ShouldBindQuery() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	list, count, err := search.ComList(models.ImageModel{}, search.Option{
		Likes:    []string{"name"},
		PageInfo: req,
	})
	if err != nil {
		global.Log.Error("search.ComList() failed", zap.Error(err))
		res.Error(c, res.ServerError, "加载失败")
		return
	}
	res.SuccessWithPage(c, list, count, req.Page, req.PageSize)
}
