package config

type Email struct {
	Host             string `mapstructure:"host"`
	Port             int    `mapstructure:"port"`
	User             string `mapstructure:"user"` // 发件人邮箱
	Password         string `mapstructure:"password"`
	DefaultFromEmail string `mapstructure:"default_from_email"` // 默认的发件人名字
	UseSSL           bool   `mapstructure:"use_ssl"`            // 是否使用ssl
	UserTls          bool   `mapstructure:"user_tls"`
}
