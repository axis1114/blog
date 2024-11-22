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
		global.Log.Error("校验参数失败", zap.Error(err))
		res.Fail(c, res.CodeValidationFail)
		return
	}
	_claims, _ := c.Get("claims")
	claims := _claims.(*utils.CustomClaims)
	userID := claims.UserID
	html, err := utils.ConvertMarkdownToHTML(req.Content)
	if err != nil {
		global.Log.Error("utils.ConvertMarkdownToHTML失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	content, err := utils.ConvertHTMLToMarkdown(html)
	if err != nil {
		global.Log.Error("utils.ConvertHTMLToMarkdown失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}

	if req.CoverID == 0 {
		var imageIDList []uint
		global.DB.Model(models.ImageModel{}).Select("id").Scan(&imageIDList)
		if len(imageIDList) == 0 {
			global.Log.Error("获取图片id失败")
			res.Fail(c, res.CodeInternalError)
			return
		}
		rand.New(rand.NewSource(time.Now().UnixNano()))
		req.CoverID = imageIDList[rand.Intn(len(imageIDList))]
	}

	var coverUrl string
	err = global.DB.Model(models.ImageModel{}).Where("id = ?", req.CoverID).Select("path").Scan(&coverUrl).Error
	if err != nil {
		global.Log.Error("获取图片路径失败")
		res.Fail(c, res.CodeInternalError)
		return
	}
	var user models.UserModel
	err = global.DB.Where("id = ?", userID).First(&user).Error
	if err != nil {
		global.Log.Error("查找user失败")
		res.Fail(c, res.CodeInternalError)
		return
	}
	id, err := utils.GenerateID()
	if err != nil {
		global.Log.Error("生成ID失败")
		res.Fail(c, res.CodeInternalError)
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
		global.Log.Error("创建文章失败", zap.Error(err))
		res.Fail(c, res.CodeInternalError)
		return
	}
	res.Success(c, nil)
}
