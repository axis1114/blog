package api

import (
	"blog/api/article"
	"blog/api/category"
	"blog/api/comment"
	"blog/api/friendlink"
	"blog/api/image"
	"blog/api/system"
	"blog/api/user"
)

type AppGroup struct {
	SystemApi     system.System
	UserApi       user.User
	ImageApi      image.Image
	ArticleApi    article.Article
	CommentApi    comment.Comment
	CategoryApi   category.Category
	FriendLinkApi friendlink.FriendLink
}

var AppGroupApp = new(AppGroup)