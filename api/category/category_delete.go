package category

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (cg *Category) CategoryDelete(c *gin.Context) {
	var req models.IDRequest
	if err := c.ShouldBindUri(&req); err != nil {
		global.Log.Error("c.ShouldBindUri() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	err := (&models.CategoryModel{
		MODEL: models.MODEL{
			ID: req.ID,
		},
	}).Delete()
	if err != nil {
		global.Log.Error("category.Delete() failed", zap.Error(err))
		res.Error(c, res.ServerError, "分类删除失败")
		return
	}
	res.Success(c, nil)
}
