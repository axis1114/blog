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
		global.Log.Error("c.ShouldBindUri() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	article, err := models.NewArticleService().GetArticle(req.ID)
	if err != nil {
		global.Log.Error("models.NewArticleService().GetArticle() failed", zap.Error(err))
		res.Error(c, res.ServerError, "加载失败")
		return
	}
	res.Success(c, article)
}
