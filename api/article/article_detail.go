package article

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ArticleDetailRequest struct {
	ID string `uri:"id"`
}

func (a *Article) ArticleDetail(c *gin.Context) {
	var req ArticleDetailRequest
	err := c.ShouldBindUri(&req)
	if err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	article, err := models.NewArticleService().GetArticle(req.ID)
	if err != nil {
		global.Log.Error("加载失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, article)
}
