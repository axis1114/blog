package article

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ArticleDeleteRequest struct {
	IDList []string `json:"id_list"`
}

func (a *Article) ArticleDelete(c *gin.Context) {
	var req ArticleDeleteRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		global.Log.Error("c.ShouldBindJSON() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}

	err = models.NewArticleService().DeleteArticles(req.IDList)
	if err != nil {
		global.Log.Error("articleService.DeleteArticles() failed", zap.Error(err))
		res.Error(c, res.ServerError, "文章删除失败")
		return
	}
	res.Success(c, nil)
}
