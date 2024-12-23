package category

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CategoryCreate struct {
	Name string `json:"name"`
}

func (cg *Category) CategoryCreate(c *gin.Context) {
	var req CategoryCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		global.Log.Error("c.ShouldBindJSON failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	err := (&models.CategoryModel{
		Name: req.Name,
	}).Create()
	if err != nil {
		global.Log.Error("category.Create() failed", zap.Error(err))
		res.Error(c, res.ServerError, "分类创建失败")
		return
	}
	res.Success(c, nil)
}
