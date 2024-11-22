package flags

import (
	"blog/global"
	"blog/models"
	"context"
	"encoding/json"
	"os"

	"github.com/elastic/go-elasticsearch/v8/typedapi/core/bulk"
	"github.com/urfave/cli/v2"
	"go.uber.org/zap"
)

func EsImport(c *cli.Context) (err error) {
	path := c.String("path")
	byteData, err := os.ReadFile(path)
	if err != nil {
		global.Log.Error("读取文件失败", zap.Error(err))
		return err
	}

	var response ESIndexResponse
	err = json.Unmarshal(byteData, &response)
	if err != nil {
		global.Log.Error("解析文件失败", zap.Error(err))
		return err
	}
	var article models.ArticleService
	err = article.CreateIndex()
	if err != nil {
		global.Log.Error("创建索引失败", zap.Error(err))
		return err
	}
	var request bulk.Request
	for _, data := range response.Data {
		request = append(request, map[string]interface{}{
			"index": map[string]interface{}{
				"_index": response.Index,
				"_id":    data.ID,
			},
		})
		request = append(request, data.Doc)
	}
	_, err = global.Es.Bulk().Index(response.Index).Request(&request).Do(context.Background())
	if err != nil {
		global.Log.Error("导入数据失败", zap.Error(err))
		return err
	}
	global.Log.Infof("Es数据添加成功,共添加 %d 条", len(response.Data))
	return nil
}
