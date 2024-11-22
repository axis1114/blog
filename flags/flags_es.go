package flags

import (
	"encoding/json"

	"blog/global"
	"blog/models"

	"github.com/urfave/cli/v2"
	"go.uber.org/zap"
)

type Data struct {
	ID  *string         `json:"id"`
	Doc json.RawMessage `json:"doc"`
}

type ESIndexResponse struct {
	Index string `json:"index"`
	Data  []Data `json:"data"`
}

func EsIndexCreate(c *cli.Context) (err error) {
	var article models.ArticleService
	err = article.CreateIndex()
	if err != nil {
		global.Log.Error("创建索引失败", zap.Error(err))
		return err
	}
	return nil
}
