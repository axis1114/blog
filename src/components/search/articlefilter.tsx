import { SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Input, message } from "antd";
import { memo, useEffect, useState } from "react";
import { articleList, articleParamsType, articleType } from "../../api/article";
import { categoryList, categoryType } from "../../api/category";

interface ArticleFilterProps {
  onSearch?: (params: articleParamsType) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

// 搜索建议下拉框样式
const dropdownStyle = {
  maxHeight: "500px",
  overflow: "auto",
  padding: "12px",
  borderRadius: "0",
  marginTop: "6px",
  border: "1px solid #d9d9d9",
  borderTop: "1px solid #d9d9d9",
};

export const ArticleFilter = memo(
  ({ onSearch, selectedCategory, onCategorySelect }: ArticleFilterProps) => {
    const [searchSuggestions, setSearchSuggestions] = useState<articleType[]>(
      []
    );
    const [categories, setCategories] = useState<categoryType[]>([]);

    // 获取分类列表
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const res = await categoryList({ page: 1, page_size: 100 });
          if (res.code === 0) {
            setCategories(res.data.list);
          }
        } catch (error) {
          message.error("获取分类列表失败");
        }
      };
      fetchCategories();
    }, []);

    // 搜索建议处理
    const handleSearchInput = async (value: string) => {
      if (!value.trim()) {
        setSearchSuggestions([]);
        return;
      }

      try {
        const res = await articleList({
          page: 1,
          page_size: 5,
          key: value,
          category: selectedCategory === "All" ? undefined : selectedCategory,
        });
        if (res.code === 0) {
          setSearchSuggestions(res.data.list);
        }
      } catch (error) {
        console.error("获取搜索建议失败:", error);
      }
    };

    // 分类选择处理
    const handleCategorySelect = (category: string) => {
      onCategorySelect(category);
      onSearch?.({
        page: 1,
        page_size: 10,
        category: category === "All" ? undefined : category,
      });
    };

    return (
      <div className="bg-white">
        {/* 搜索框 */}
        <div className="p-8">
          <AutoComplete
            style={{ width: "100%" }}
            onSearch={handleSearchInput}
            onSelect={(_, option) =>
              (window.location.href = `/article/${option.key}`)
            }
            dropdownStyle={dropdownStyle}
            options={searchSuggestions.map((article) => ({
              label: (
                <div className="p-2">
                  <div className="text-[15px] mb-1 truncate">
                    {article.title}
                  </div>
                </div>
              ),
              value: article.title,
              key: article.id,
            }))}>
            <Input.Search
              placeholder="搜索文章..."
              allowClear
              enterButton={<SearchOutlined className="text-lg" />}
              size="large"
              className="square-search-input"
            />
          </AutoComplete>
        </div>

        {/* 分类列表 */}
        <div className="px-8 pb-8">
          <h5 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📑</span>分类
          </h5>
          <div className="space-y-2">
            <CategoryItem name="All" onClick={handleCategorySelect} />
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                name={category.name}
                onClick={handleCategorySelect}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

// 分类项组件
const CategoryItem = ({
  name,
  onClick,
}: {
  name: string;
  onClick: (name: string) => void;
}) => (
  <div
    className="px-6 py-3 cursor-pointer transition-all duration-300 text-gray-600 hover:bg-gray-50"
    onClick={() => onClick(name)}>
    <span className="text-base font-medium">{name}</span>
  </div>
);
