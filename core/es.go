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
		// 添加超时设置
		MaxRetries:    3,
		RetryOnStatus: []int{502, 503, 504},
		RetryBackoff: func(attempt int) time.Duration {
			return time.Duration(attempt) * time.Second
		},
		// 设置连接超时
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout: 5 * time.Second,
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
	// 创建带超时的context
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	// 健康检查
	res, err := es.Info().Do(ctx)
	if err != nil {
		global.Log.Error("ES健康检查失败",
			zap.String("dsn", esConfig.Dsn()),
			zap.Error(err))
		return nil
	}
	global.Log.Info("ES连接成功",
		zap.String("version", res.Version.Int),
		zap.String("cluster_name", res.ClusterName))
	return es
}
