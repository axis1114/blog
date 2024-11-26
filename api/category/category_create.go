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
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	err := (&models.CategoryModel{
		Name: req.Name,
	}).Create()
	if err != nil {
		global.Log.Error("分类创建失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
