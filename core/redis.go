package core

import (
	"blog/global"
	"context"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

func InitRedis() *redis.Client {
	// 获取Redis配置
	redisConf := global.Config.Redis

	// 创建Redis客户端配置
	opts := &redis.Options{
		Addr:     redisConf.Addr(),
		Password: redisConf.Password,
		DB:       redisConf.DB,
		PoolSize: redisConf.PoolSize,
		// 添加连接超时设置
		DialTimeout:  time.Second * 5,
		ReadTimeout:  time.Second * 3,
		WriteTimeout: time.Second * 3,
		// 添加连接池配置
		MinIdleConns: 10,
		MaxRetries:   3,
	}
	// 创建Redis客户端
	rdb := redis.NewClient(opts)
	// 创建带超时的context
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	// 测试连接并重试
	var err error
	for i := 0; i < 3; i++ {
		_, err = rdb.Ping(ctx).Result()
		if err == nil {
			break
		}
		global.Log.Warn("Redis连接重试",
			zap.Int("重试次数", i+1),
			zap.Error(err))
		time.Sleep(time.Second)
	}
	// 最终检查连接状态
	if err != nil {
		global.Log.Fatal("Redis初始化失败",
			zap.String("地址", redisConf.Addr()),
			zap.Error(err))
	}
	global.Log.Info("Redis连接成功")
	return rdb
}
