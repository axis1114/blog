package router

import (
	"blog/api"
	"blog/middleware"
)

func (router RouterGroup) CommentRouter() {
	commentApi := api.AppGroupApp.CommentApi
	commentRouter := router.Group("comment")
	commentRouter.POST("list", commentApi.CommentList)
	commentRouter.DELETE(":id", middleware.JwtAdmin(), commentApi.CommentDelete)
	commentRouter.POST("", middleware.JwtAuth(), commentApi.CommentCreate)
}
