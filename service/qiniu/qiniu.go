package qiniu

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"time"

	"blog/config"

	"github.com/qiniu/go-sdk/v7/auth/qbox"
	"github.com/qiniu/go-sdk/v7/storage"
)

// QiniuUploader 七牛云上传器结构体
type QiniuUploader struct {
	config config.QiNiu
}

// NewQiniuUploader 创建七牛云上传器实例
func NewQiniuUploader(cfg config.QiNiu) (*QiniuUploader, error) {
	if cfg.AccessKey == "" || cfg.SecretKey == "" {
		return nil, errors.New("七牛云配置错误：accessKey 或 secretKey 未设置")
	}
	return &QiniuUploader{config: cfg}, nil
}

// getToken 获取上传凭证（私有方法）
func (q *QiniuUploader) getToken() string {
	putPolicy := storage.PutPolicy{
		Scope: q.config.Bucket,
		// 添加上传策略，比如文件过期时间
		Expires: 7200, // 示例：2小时后过期
	}
	mac := qbox.NewMac(q.config.AccessKey, q.config.SecretKey)
	return putPolicy.UploadToken(mac)
}

// getCfg 获取上传配置（私有方法）
func (q *QiniuUploader) getCfg() (*storage.Config, error) {
	zone, ok := storage.GetRegionByID(storage.RegionID(q.config.Zone))
	if !ok {
		return nil, fmt.Errorf("获取存储区域失败：无效的区域ID")
	}

	return &storage.Config{
		Zone:          &zone,
		UseHTTPS:      true, // 建议使用HTTPS
		UseCdnDomains: true, // 建议使用CDN加速
	}, nil
}

// UploadImage 上传图片
func (q *QiniuUploader) UploadImage(ctx context.Context, data []byte, imageName, prefix string) (string, error) {
	// 参数验证
	if len(data) == 0 {
		return "", errors.New("上传数据不能为空")
	}

	if float64(len(data))/1024/1024 > q.config.Size {
		return "", fmt.Errorf("文件大小超过限制：%.2fMB", q.config.Size)
	}

	// 获取配置
	cfg, err := q.getCfg()
	if err != nil {
		return "", err
	}

	// 构建文件名
	key := fmt.Sprintf("%s/%s__%s",
		prefix,
		time.Now().Format("20060102150405"),
		imageName,
	)

	// 上传文件
	formUploader := storage.NewFormUploader(cfg)
	ret := storage.PutRet{}
	putExtra := storage.PutExtra{
		Params: map[string]string{
			"x-qn-meta-name": imageName, // 添加自定义元数据
		},
	}

	if err := formUploader.Put(ctx, &ret, q.getToken(), key, bytes.NewReader(data), int64(len(data)), &putExtra); err != nil {
		return "", fmt.Errorf("上传文件失败：%w", err)
	}

	return fmt.Sprintf("%s%s", q.config.CDN, ret.Key), nil
}
