package category

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/service/search"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (cg *Category) CategoryList(c *gin.Context) {
	var req models.PageInfo
	if err := c.ShouldBindQuery(&req); err != nil {
		global.Log.Error("c.ShouldBindQuery failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	list, count, err := search.ComList(models.CategoryModel{}, search.Option{
		PageInfo: req,
	})
	if err != nil {
		global.Log.Error("search.ComList() failed", zap.Error(err))
		res.Error(c, res.ServerError, "加载失败")
		return
	}
	res.SuccessWithPage(c, list, count, req.Page, req.PageSize)
}
