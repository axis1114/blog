package core

import (
	"blog/global"

	"github.com/cc14514/go-geoip2"
	geoip2db "github.com/cc14514/go-geoip2-db"
	"go.uber.org/zap"
)

func InitAddrDB() *geoip2.DBReader {
	db, err := geoip2db.NewGeoipDbByStatik()
	if err != nil {
		global.Log.Fatal("初始化地址库失败", zap.Error(err))
	}
	return db
}
