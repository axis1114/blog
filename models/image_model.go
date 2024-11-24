package models

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"strings"

	"blog/global"
	"blog/service/qiniu"
	utils "blog/utils"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// WhiteList 定义允许上传的图片格式
var WhiteList = []string{
	"jpg", "png", "jpeg", "ico",
	"tiff", "gif", "svg", "webp",
}

type ImageModel struct {
	MODEL
	Path string `json:"path"`
	Hash string `json:"hash" gorm:"uniqueIndex:idx_hash,length:32"`
	Name string `json:"name"`
	Type string `json:"type"`
	Size int64  `json:"size"`
}

// UploadResponse 定义上传响应结构
type UploadResponse struct {
	FileName  string `json:"file_name"`
	IsSuccess bool   `json:"is_success"`
	Msg       string `json:"msg"`
	Size      int64  `json:"size,omitempty"`
	Hash      string `json:"hash,omitempty"`
}

// validateImage 图片验证函数
func (im *ImageModel) validateImage(file *multipart.FileHeader) error {
	// 验证文件格式
	nameList := strings.Split(file.Filename, ".")
	suffix := strings.ToLower(nameList[len(nameList)-1])
	if !utils.InList(suffix, WhiteList) {
		return fmt.Errorf("不支持的文件格式: %s", suffix)
	}

	// 验证文件大小
	size := float64(file.Size) / float64(1024*1024)
	if size >= float64(global.Config.Upload.Size) {
		return fmt.Errorf("图片大小超过设定,当前大小为:%.2fMB,设定大小为:%dMB",
			size, global.Config.Upload.Size)
	}
	return nil
}

// Upload 优化上传函数
func (im *ImageModel) Upload(file *multipart.FileHeader) (res UploadResponse) {
	// 1. 验证图片
	if err := im.validateImage(file); err != nil {
		res.Msg = err.Error()
		return
	}

	// 2. 读取并处理文件
	byteData, err := im.readFileContent(file)
	if err != nil {
		res.Msg = err.Error()
		return
	}

	// 3. 检查重复文件
	imageHash := utils.Md5(byteData)
	if existingImage, exists := im.checkDuplicate(imageHash); exists {
		return existingImage
	}

	// 4. 处理文件上传（本地或七牛云）
	filePath, fileType, err := im.processUpload(file, byteData)
	if err != nil {
		res.Msg = err.Error()
		return
	}

	// 5. 保存记录到数据库
	if err := im.saveImageRecord(file, filePath, fileType, imageHash); err != nil {
		res.Msg = "保存图片记录失败"
		return
	}

	return UploadResponse{
		FileName:  filePath,
		IsSuccess: true,
		Msg:       "上传成功",
		Size:      file.Size,
		Hash:      imageHash,
	}
}

// readFileContent 读取文件内容
func (im *ImageModel) readFileContent(file *multipart.FileHeader) ([]byte, error) {
	fileObj, err := file.Open()
	if err != nil {
		global.Log.Error("打开文件失败", zap.Error(err))
		return nil, fmt.Errorf("无法打开文件")
	}
	defer fileObj.Close()

	return io.ReadAll(fileObj)
}

// checkDuplicate 检查重复文件
func (im *ImageModel) checkDuplicate(hash string) (UploadResponse, bool) {
	var existImage ImageModel
	if err := global.DB.Where("hash = ?", hash).First(&existImage).Error; err == nil {
		return UploadResponse{
			FileName:  existImage.Path,
			IsSuccess: true,
			Msg:       "图片已存在",
			Hash:      hash,
		}, true
	}
	return UploadResponse{}, false
}

// processUpload 处理文件上传
func (im *ImageModel) processUpload(file *multipart.FileHeader, data []byte) (string, string, error) {
	fileName := file.Filename
	basePath := global.Config.Upload.Path
	filePath := "/" + path.Join(basePath, fileName)
	fileType := "local"

	if global.Config.QiNiu.Enable {
		uploader, err := qiniu.NewQiniuUploader(global.Config.QiNiu)
		if err != nil {
			return "", "", fmt.Errorf("七牛云初始化失败: %v", err)
		}

		qiniuPath, err := uploader.UploadImage(context.Background(), data, fileName, basePath)
		if err != nil {
			return "", "", fmt.Errorf("七牛云上传失败: %v", err)
		}

		return qiniuPath, "qiniu", nil
	}

	return filePath, fileType, nil
}

// saveImageRecord 保存图片记录
func (im *ImageModel) saveImageRecord(file *multipart.FileHeader, filePath, fileType, hash string) error {
	im.Hash = hash
	im.Path = filePath
	im.Name = file.Filename
	im.Type = fileType
	im.Size = file.Size

	return global.DB.Create(im).Error
}

// BeforeDelete 优化删除钩子
func (im *ImageModel) BeforeDelete(tx *gorm.DB) error {
	if im.Type == "local" {
		if err := os.Remove(im.Path[1:]); err != nil {
			global.Log.Error("删除本地文件失败",
				zap.String("path", im.Path),
				zap.Error(err))
		}
	} else if im.Type == "qiniu" {
		// 实现七牛云文件删除逻辑
		if err := im.deleteFromQiNiu(); err != nil {
			global.Log.Error("删除七牛云文件失败",
				zap.String("path", im.Path),
				zap.Error(err))
		}
	}
	return nil
}

// deleteFromQiNiu 新增七牛云文件删除方法
func (im *ImageModel) deleteFromQiNiu() error {
	// TODO: 实现七牛云文件删除逻辑
	return nil
}
