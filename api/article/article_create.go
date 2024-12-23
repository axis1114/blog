package article

import (
	"math/rand"
	"strconv"
	"time"

	"blog/global"
	"blog/models"
	"blog/models/res"
	"blog/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ArticleRequest struct {
	Title    string `json:"title"`
	Abstract string `json:"abstract"`
	Category string `json:"category"`
	Content  string `json:"content" `
	CoverID  uint   `json:"cover_id"`
}

func (a *Article) ArticleCreate(c *gin.Context) {
	var req ArticleRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		global.Log.Error("c.ShouldBindJSON() failed", zap.Error(err))
		res.Error(c, res.InvalidParameter, "参数验证失败")
		return
	}
	_claims, _ := c.Get("claims")
	claims := _claims.(*utils.CustomClaims)
	userID := claims.UserID
	html, err := utils.ConvertMarkdownToHTML(req.Content)
	if err != nil {
		global.Log.Error("utils.ConvertMarkdownToHTML() failed", zap.Error(err))
		res.Error(c, res.ServerError, "utils.ConvertMarkdownToHTML失败")
		return
	}
	content, err := utils.ConvertHTMLToMarkdown(html)
	if err != nil {
		global.Log.Error("utils.ConvertHTMLToMarkdown() failed", zap.Error(err))
		res.Error(c, res.ServerError, "utils.ConvertHTMLToMarkdown失败")
		return
	}

	if req.CoverID == 0 {
		var imageIDList []uint
		global.DB.Model(models.ImageModel{}).Select("id").Scan(&imageIDList)
		if len(imageIDList) == 0 {
			global.Log.Error("global.DB.Model(models.ImageModel{}).Select() failed", zap.Error(err))
			res.Error(c, res.ServerError, "获取图片id失败")
			return
		}
		rand.New(rand.NewSource(time.Now().UnixNano()))
		req.CoverID = imageIDList[rand.Intn(len(imageIDList))]
	}

	var coverUrl string
	err = global.DB.Model(models.ImageModel{}).Where("id = ?", req.CoverID).Select("path").Scan(&coverUrl).Error
	if err != nil {
		global.Log.Error("global.DB.Model(models.ImageModel{}).Where().Select().Scan() failed", zap.Error(err))
		res.Error(c, res.ServerError, "获取图片路径失败")
		return
	}
	var user models.UserModel
	err = global.DB.Where("id = ?", userID).First(&user).Error
	if err != nil {
		global.Log.Error("global.DB.Where().First() failed", zap.Error(err))
		res.Error(c, res.ServerError, "查找user失败")
		return
	}
	id, err := utils.GenerateID()
	if err != nil {
		global.Log.Error("utils.GenerateID() failed", zap.Error(err))
		res.Error(c, res.ServerError, "生成ID失败")
		return
	}
	article := models.Article{
		ID:       strconv.FormatInt(id, 10),
		Title:    req.Title,
		Abstract: req.Abstract,
		Category: req.Category,
		Content:  content,
		CoverID:  req.CoverID,
		CoverURL: coverUrl,
		UserID:   userID,
		UserName: user.Nickname,
	}
	articleService := models.NewArticleService()
	err = articleService.CreateArticle(&article)
	if err != nil {
		global.Log.Error("articleService.CreateArticle() failed", zap.Error(err))
		res.Error(c, res.ServerError, "创建文章失败")
		return
	}
	res.Success(c, nil)
}
