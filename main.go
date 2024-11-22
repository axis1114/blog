package main

import (
	"fmt"

	"blog/core"
	"blog/flags"
	"blog/global"
	"blog/router"
	"blog/utils"

	"go.uber.org/zap"
)

func main() {
	core.InitConf()
	global.Log = core.InitLog()
	global.DB = core.InitGorm()
	global.Redis = core.InitRedis()
	global.Es = core.InitEs()
	global.AddrDB = core.InitAddrDB()
	utils.Init(global.Config.System.StartTime, global.Config.System.MachineID)
	flags.Newflags()
	utils.PrintSystem()
	router := router.InitRouter()
	err := router.Run(fmt.Sprintf(":%d", global.Config.System.Port))
	if err != nil {
		global.Log.Fatal("启动服务失败", zap.Error(err))
	}
}
