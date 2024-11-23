package models

import (
	"errors"
	"fmt"

	"blog/global"
	"blog/models/ctypes"
	"blog/utils"
)

// UserModel 用户模型
type UserModel struct {
	MODEL    `json:","`
	Nickname string          `json:"nick_name" gorm:"column:nick_name"`
	Account  string          `json:"account" gorm:"uniqueIndex:idx_account,length:191"`
	Password string          `json:"-"`
	Email    string          `json:"email"`
	Address  string          `json:"address"`
	Token    string          `json:"token"`
	Role     ctypes.UserRole `json:"role"`
}

// Create 创建用户
func (u *UserModel) Create(ip string) error {

	// 检查用户是否存在
	if err := u.checkExists(); err != nil {
		return fmt.Errorf("用户检查失败: %w", err)
	}

	// 密码加密
	hashedPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		return fmt.Errorf("密码处理失败: %w", err)
	}
	u.Password = hashedPassword

	// 获取地址信息
	u.Address = utils.GetAddrByIp(ip)

	// 创建事务
	tx := global.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 创建用户
	if err := tx.Create(u).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("创建用户失败: %w", err)
	}

	return tx.Commit().Error
}

// checkExists 检查用户是否已存在
func (u *UserModel) checkExists() error {
	var count int64
	global.DB.Model(&UserModel{}).Where("nick_name = ? OR account = ?", u.Nickname, u.Account).Count(&count)
	if count > 0 {
		return errors.New("用户名或账号已存在")
	}
	return nil
}

// FindByNickname 根据昵称查找用户
func (u *UserModel) FindByNickname(nickname string) error {
	return global.DB.Where("nick_name = ?", nickname).Take(u).Error
}

// FindByAccount 根据账号查找用户
func (u *UserModel) FindByAccount(account string) error {
	return global.DB.Where("account = ?", account).Take(u).Error
}

// UpdatePassword 更新用户密码
func (u *UserModel) UpdatePassword(newPassword string) error {
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("密码处理失败: %w", err)
	}

	return global.DB.Model(u).Update("password", hashedPassword).Error
}

// UpdateProfile 更新用户信息
func (u *UserModel) UpdateProfile(updates map[string]interface{}) error {
	// 过滤敏感字段
	delete(updates, "password")
	delete(updates, "role")
	delete(updates, "account")

	return global.DB.Model(u).Updates(updates).Error
}

// UpdateToken 更新用户token
func (u *UserModel) UpdateToken(token string) error {
	return global.DB.Model(u).Update("token", token).Error
}
