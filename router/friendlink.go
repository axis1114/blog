package router

import (
	"blog/api"
	"blog/middleware"
)

func (r *RouterGroup) FriendLinkRouter() {
	friendlinkRouter := r.Group("friendlink")
	friendlinkApi := api.AppGroupApp.FriendLinkApi
	friendlinkRouter.POST("", middleware.JwtAdmin(), friendlinkApi.FriendLinkCreate)
	friendlinkRouter.GET("", friendlinkApi.FriendLinkList)
	friendlinkRouter.DELETE(":id", middleware.JwtAdmin(), friendlinkApi.FriendLinkDelete)
}
