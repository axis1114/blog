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
		global.Log.Error("c.ShouldBindQuery() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
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
		global.Log.Error("models.NewArticleService().SearchArticles() failed", zap.Error(err))
		res.Error(c, res.ServerError, "搜索文章失败")
		return
	}
	res.SuccessWithPage(c, articles.Articles, articles.Total, req.Page, req.PageSize)
}
