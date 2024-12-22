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
		log.Fatalf("viper.ReadInConfig() Failed, err:%v\n", err)
	}
	if err := viper.Unmarshal(&global.Config); err != nil {
		log.Fatalf("viper.Unmarshal() Failed, err:%v\n", err)
	}
	viper.WatchConfig()
	viper.OnConfigChange(func(in fsnotify.Event) {
		log.Println("Config file changed...")
		if err := viper.Unmarshal(global.Config); err != nil {
			log.Fatalf("viper.Unmarshal() Failed, err:%v\n", err)
		}
	})
}
