package flags

import (
	"blog/global"
	"blog/models"

	"github.com/urfave/cli/v2"
)

func DB(c *cli.Context) (err error) {
	err = global.DB.Set("gorm:table_options", "ENGINE=InnoDB").
		AutoMigrate(&models.UserModel{},
			&models.ImageModel{},
			&models.CommentModel{},
			&models.CategoryModel{},
			&models.FriendLinkModel{},
		)
	if err != nil {
		global.Log.Error("[ error ] 生成数据库表结构失败")
		return nil
	}
	global.Log.Info("[ success ] 生成数据库表结构成功！")
	return nil
}
