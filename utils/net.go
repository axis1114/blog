package utils

import (
	"blog/global"
	"net"

	"go.uber.org/zap"
)

func GetIPList() (ipList []string) {
	interfaces, err := net.Interfaces()
	if err != nil {
		global.Log.Error("net.Interfaces出现错误", zap.Error(err))
	}
	for _, i2 := range interfaces {
		address, err := i2.Addrs()
		if err != nil {
			continue
		}
		for _, addr := range address {
			ipNet, ok := addr.(*net.IPNet)
			if !ok {
				continue
			}
			ip4 := ipNet.IP.To4()
			if ip4 == nil {
				continue
			}
			ipList = append(ipList, ip4.String())
		}
	}
	return
}
