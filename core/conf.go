package core

import (
	"blog/global"
	"log"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

const filePath = "settings.yaml"

func InitConf() {
	viper.SetConfigFile(filePath)
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("读取配置信息失败, err:%v\n", err)
	}
	if err := viper.Unmarshal(&global.Config); err != nil {
		log.Fatalf("viper反序列化失败, err:%v\n", err)
	}
	viper.WatchConfig()
	viper.OnConfigChange(func(in fsnotify.Event) {
		log.Println("配置文件发生改变...")
		if err := viper.Unmarshal(global.Config); err != nil {
			log.Fatalf("viper反序列化失败, err:%v\n", err)
		}
	})
}
