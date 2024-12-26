package article

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (a *Article) GetArticleData(c *gin.Context) {
	var data *models.ArticleStats
	articleService := models.NewArticleService()
	data, err := articleService.GetArticleStats()
	if err != nil {
		global.Log.Error("articleService.GetArticleStats() failed", zap.Error(err))
		res.Error(c, res.ServerError, "获取文章数据失败")
		return
	}
	res.Success(c, data)
}
