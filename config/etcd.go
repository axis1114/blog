package config

import "fmt"

type Etcd struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

func (e Etcd) Addr() string {
	return fmt.Sprintf("%s:%d", e.Host, e.Port)
}
