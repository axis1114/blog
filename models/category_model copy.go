package models

import "blog/global"

type CategoryModel struct {
	MODEL `json:","`
	Name  string `json:"name"`
}

func (c *CategoryModel) Create() error {
	tx := global.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(c).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (c *CategoryModel) Delete() error {
	tx := global.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Delete(c).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
