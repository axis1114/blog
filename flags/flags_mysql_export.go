package flags

import (
	"blog/global"
	"bytes"
	"fmt"
	"os/exec"
	"runtime"
	"time"

	"github.com/urfave/cli/v2"
	"go.uber.org/zap"
)

func MysqlExport(c *cli.Context) (err error) {
	mysql := global.Config.Mysql
	timer := time.Now().Format("20060102")

	sqlPath := fmt.Sprintf("./%s_%s.sql", mysql.DB, timer)

	cmder := fmt.Sprintf("docker exec mysql8.0.39 mysqldump -uroot -proot blog > %s", sqlPath)

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("cmd", "/C", cmder)
	} else {
		cmd = exec.Command("sh", "-c", cmder)
	}

	var out, stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		global.Log.Error("导出数据库失败",
			zap.Error(err),
			zap.String("stderr", stderr.String()),
		)
		return fmt.Errorf("导出数据库失败: %v, stderr: %s", err, stderr.String())
	}

	global.Log.Info("数据库导出成功",
		zap.String("文件路径", sqlPath),
		zap.String("数据库", mysql.DB),
	)
	return nil
}
