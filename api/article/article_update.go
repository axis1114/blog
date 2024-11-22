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
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	var coverUrl string
	if req.CoverID != 0 {
		err = global.DB.Model(models.ImageModel{}).Where("id = ?", req.CoverID).Select("path").Scan(&coverUrl).Error
		if err != nil {
			global.Log.Error("选择图片路径失败", zap.Error(err))
			res.Fail(c, res.CodeInternalError)
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
		global.Log.Error("文章更新失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
