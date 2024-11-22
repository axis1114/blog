package api

import (
	"blog/api/article"
	"blog/api/image"
	"blog/api/system"
	"blog/api/user"
)

type AppGroup struct {
	SystemApi  system.System
	UserApi    user.User
	ImageApi   image.Image
	ArticleApi article.Article
}

var AppGroupApp = new(AppGroup)
