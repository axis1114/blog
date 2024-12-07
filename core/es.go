package core

import (
	"blog/global"
	"context"

	"github.com/elastic/go-elasticsearch/v8"
	"go.uber.org/zap"
)

func InitEs() *elasticsearch.TypedClient {
	dsn := global.Config.Es.Dsn()
	cfg := elasticsearch.Config{
		Addresses: []string{
			dsn,
		},
	}
	es, err := elasticsearch.NewTypedClient(cfg)
	if err != nil {
		global.Log.Fatal("es连接失败", 
			zap.String("dsn", dsn), 
			zap.Error(err))
	}
	
	res, err := es.Info().Do(context.Background())
	if err != nil {
		global.Log.Fatal("es健康检查失败",
			zap.String("dsn", dsn),
			zap.Error(err))
	}
	
	global.Log.Info("es连接成功", zap.Any("res", res))
	
	return es
}
