package user

import (
	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/service/search"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (u *User) UserList(c *gin.Context) {
	var req models.PageInfo
	err := c.ShouldBindQuery(&req)
	if err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	list, count, err := search.ComList(models.UserModel{}, search.Option{
		Likes:    []string{"nick_name"},
		PageInfo: req,
	})
	if err != nil {
		global.Log.Error("加载失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.SuccessWithPage(c, list, int(count), req.Page, req.PageSize)
}
