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
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}

	err = models.NewArticleService().DeleteArticles(req.IDList)
	if err != nil {
		global.Log.Error("文章删除失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
