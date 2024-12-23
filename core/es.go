package core

import (
	"blog/global"
	"context"
	"net"
	"net/http"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"go.uber.org/zap"
)

func InitEs() *elasticsearch.TypedClient {
	// 从配置中获取ES连接信息
	esConfig := global.Config.Es
	cfg := elasticsearch.Config{
		Addresses: []string{esConfig.Dsn()},
		// 基础重试设置
		MaxRetries: 3,
		// 基础连接设置
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout: 10 * time.Second, // 连接超时10秒
			}).DialContext,
		},
	}
	// 创建ES客户端
	es, err := elasticsearch.NewTypedClient(cfg)
	if err != nil {
		global.Log.Error("ES客户端创建失败",
			zap.String("dsn", esConfig.Dsn()),
			zap.Error(err))
		return nil
	}
	// 增加健康检查超时时间
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	// 健康检查
	_, err = es.Info().Do(ctx)
	if err != nil {
		global.Log.Error("ES健康检查失败",
			zap.String("dsn", esConfig.Dsn()),
			zap.Error(err))
		return nil
	}
	global.Log.Info("ES连接成功")
	return es
}
