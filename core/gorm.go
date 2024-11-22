package core

import (
	"fmt"
	"os"
	"strings"
	"time"

	"blog/global"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitGorm() *gorm.DB {
	if global.Config.Mysql.Host == "" {
		global.Log.Fatal("未配置mysql，取消gorm连接")
	}

	dsn := global.Config.Mysql.Dsn()

	var mysqlLogger logger.Interface
	if global.Config.System.Env == "dev" {
		// 开发环境显示所有的sql
		mysqlLogger = logger.Default.LogMode(logger.Info)
	} else {
		// 只打印错误的sql
		mysqlLogger = logger.Default.LogMode(logger.Error)
	}

	//通过gorm.Open()函数连接到MySQL数据库，并设置日志记录器为上一步配置的mysqlLogger
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: mysqlLogger,
	})
	if err != nil {
		if strings.Contains(err.Error(), "1049") {
			global.Log.Error(fmt.Sprintf("数据库不存在: %s", global.Config.Mysql.DB))
			//自动创建
			dsn := global.Config.Mysql.DSNWithoutDB()
			serverDB, _ := gorm.Open(mysql.Open(dsn), &gorm.Config{
				Logger: mysqlLogger,
			})
			// 执行创建数据库SQL
			createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARSET utf8mb4 COLLATE utf8mb4_general_ci", global.Config.Mysql.DB)
			if err = serverDB.Exec(createDBSQL).Error; err != nil {
				global.Log.Fatal("创建数据库失败", zap.Error(err))
			}
			global.Log.Info(fmt.Sprintf("数据库 %s 创建成功,请创建表结构", global.Config.Mysql.DB))
			os.Exit(0)
		} else {
			global.Log.Fatalf("[%s] mysql连接失败", dsn, zap.Error(err))
		}
	}
	sqlDB, err := db.DB()
	if err != nil {
		global.Log.Fatal("数据库连接失败", zap.Error(err))
	}
	// 最大空闲连接数
	sqlDB.SetMaxIdleConns(global.Config.Mysql.MaxIdleConns)
	// 最多可容纳
	sqlDB.SetMaxOpenConns(global.Config.Mysql.MaxOpenConns)
	// 连接最大复用时间，不能超过mysql的wait_timeout
	sqlDB.SetConnMaxLifetime(time.Hour * 4)
	return db
}
