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
		global.Log.Error("c.ShouldBindUri failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	var image models.ImageModel
	err = global.DB.First(&image, req.ID).Error
	if err != nil {
		global.Log.Error("global.DB.First() failed", zap.Error(err))
		res.Error(c, res.NotFound, "图片不存在")
		return
	}
	err = global.DB.Delete(&image).Error
	if err != nil {
		global.Log.Error("image.Delete() failed", zap.Error(err))
		res.Error(c, res.ServerError, "图片删除失败")
		return
	}
	res.Success(c, nil)
}
