package flags

import (
	"blog/global"
	"os"
	"strings"

	"github.com/urfave/cli/v2"
	"go.uber.org/zap"
)

func MysqlImport(c *cli.Context) (err error) {
	path := c.String("path")
	byteData, err := os.ReadFile(path)
	if err != nil {
		global.Log.Error("导入数据库失败", zap.Error(err))
		return err
	}
	//分割数据 一定要按照\r\n分割
	sqlList := strings.Split(string(byteData), ";\r\n")
	for _, sql := range sqlList {
		//去除字符串开头和结尾的空白符
		sql = strings.TrimSpace(sql)
		if sql == "" {
			continue
		}
		//执行sql语句
		err = global.DB.Exec(sql).Error
		if err != nil {
			global.Log.Error("导入数据库失败", zap.Error(err))
			continue
		}
	}
	return nil
}
