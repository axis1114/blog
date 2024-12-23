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
	// 验证配置
	if err := validateMysqlConfig(); err != nil {
		global.Log.Fatal("MySQL配置验证失败", zap.Error(err))
		return nil
	}

	// 获取DSN和日志配置
	dsn := global.Config.Mysql.Dsn()
	mysqlLogger := getMysqlLogger()

	// 连接数据库
	db, err := connectDatabase(dsn, mysqlLogger)
	if err != nil {
		handleDatabaseError(err, mysqlLogger)
		return nil
	}

	// 配置连接池
	if err := configureConnectionPool(db); err != nil {
		global.Log.Fatal("配置连接池失败", zap.Error(err))
		return nil
	}

	global.Log.Info("MySQL连接成功")
	return db
}

// 验证MySQL配置
func validateMysqlConfig() error {
	if global.Config.Mysql.Host == "" {
		return fmt.Errorf("未配置MySQL主机地址")
	}
	return nil
}

// 获取MySQL日志记录器
func getMysqlLogger() logger.Interface {
	if global.Config.System.Env == "debug" {
		return logger.Default.LogMode(logger.Info)
	}
	return logger.Default.LogMode(logger.Error)
}

// 连接数据库
func connectDatabase(dsn string, mysqlLogger logger.Interface) (*gorm.DB, error) {
	return gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: mysqlLogger,
	})
}

// 处理数据库错误
func handleDatabaseError(err error, mysqlLogger logger.Interface) {
	if strings.Contains(err.Error(), "1049") {
		global.Log.Error(fmt.Sprintf("数据库不存在: %s", global.Config.Mysql.DB))
		createDatabase(mysqlLogger)
	} else {
		global.Log.Fatal("MySQL连接失败",
			zap.String("dsn", global.Config.Mysql.Dsn()),
			zap.Error(err))
	}
}

// 创建数据库
func createDatabase(mysqlLogger logger.Interface) {
	dsn := global.Config.Mysql.DSNWithoutDB()
	serverDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: mysqlLogger,
	})
	if err != nil {
		global.Log.Fatal("连接MySQL服务器失败", zap.Error(err))
		return
	}

	createDBSQL := fmt.Sprintf(
		"CREATE DATABASE IF NOT EXISTS `%s` CHARSET utf8mb4 COLLATE utf8mb4_general_ci",
		global.Config.Mysql.DB,
	)

	if err = serverDB.Exec(createDBSQL).Error; err != nil {
		global.Log.Fatal("创建数据库失败", zap.Error(err))
		return
	}

	global.Log.Info(fmt.Sprintf("数据库 %s 创建成功，请创建表结构", global.Config.Mysql.DB))
	os.Exit(0)
}

// 配置连接池
func configureConnectionPool(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxIdleConns(global.Config.Mysql.MaxIdleConns)
	sqlDB.SetMaxOpenConns(global.Config.Mysql.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour * 4)

	return nil
}
