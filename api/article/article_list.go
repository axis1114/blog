package article

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ArticleListRequest struct {
	models.SearchParams
}

func (a *Article) ArticleList(c *gin.Context) {
	var req ArticleListRequest
	err := c.ShouldBindQuery(&req)
	if err != nil {
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 10
	}

	articles, err := models.NewArticleService().SearchArticles(req.SearchParams)
	if err != nil {
		global.Log.Error("搜索文章失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.SuccessWithPage(c, articles.Articles, int(articles.Total), req.Page, req.PageSize)
}
