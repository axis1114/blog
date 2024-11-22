package image

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (i *Image) ImageDelete(c *gin.Context) {
	var req models.IDRequest
	err := c.ShouldBindUri(&req)
	if err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	var image models.ImageModel
	err = global.DB.First(&image, req.ID).Error
	if err != nil {
		global.Log.Error("获取图片id失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	err = global.DB.Delete(&image).Error
	if err != nil {
		global.Log.Error("图片删除失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
