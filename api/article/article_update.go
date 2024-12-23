package article

import (
	"blog/global"
	"blog/models"
	"blog/models/res"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ArticleUpdateRequest struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Abstract string `json:"abstract"`
	Content  string `json:"content"`
	Category string `json:"category"`
	CoverID  uint   `json:"cover_id"`
}

func (a *Article) ArticleUpdate(c *gin.Context) {
	var req ArticleUpdateRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		global.Log.Error("c.ShouldBindJSON() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	var coverUrl string
	if req.CoverID != 0 {
		err = global.DB.Model(models.ImageModel{}).Where("id = ?", req.CoverID).Select("path").Scan(&coverUrl).Error
		if err != nil {
			global.Log.Error("global.DB.Model(models.ImageModel{}).Where().Select().Scan() failed", zap.Error(err))
			res.Error(c, res.ServerError, "选择图片路径失败")
			return
		}
	}
	article := models.Article{
		ID:       req.ID,
		Title:    req.Title,
		Abstract: req.Abstract,
		Content:  req.Content,
		Category: req.Category,
		CoverID:  req.CoverID,
		CoverURL: coverUrl,
	}
	err = models.NewArticleService().UpdateArticle(&article)
	if err != nil {
		global.Log.Error("models.NewArticleService().UpdateArticle() failed", zap.Error(err))
		res.Error(c, res.ServerError, "文章更新失败")
		return
	}
	res.Success(c, nil)
}
