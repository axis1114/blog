package core

import (
	"blog/global"

	"github.com/elastic/go-elasticsearch/v8"
	"go.uber.org/zap"
)

func InitEs() *elasticsearch.TypedClient {
	dsn := global.Config.Es.Dsn()
	cfg := elasticsearch.Config{
		Addresses: []string{
			global.Config.Es.Dsn(),
		},
	}
	es, err := elasticsearch.NewTypedClient(cfg)
	if err != nil {
		global.Log.Fatalf("[%s] es连接失败", dsn, zap.Error(err))
	}
	return es
}
