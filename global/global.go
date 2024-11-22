package global

import (
	"blog/config"

	"github.com/cc14514/go-geoip2"
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	Config *config.Config
	DB     *gorm.DB
	Redis  *redis.Client
	Es     *elasticsearch.TypedClient
	Log    *zap.SugaredLogger
	AddrDB *geoip2.DBReader
)
