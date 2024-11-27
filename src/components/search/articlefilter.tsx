import { AutoComplete, Input, Typography, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { articleList, articleType, articleParamsType } from '../../api/article';
import { categoryList, categoryType } from '../../api/category';
import { useEffect, useState } from 'react';

const { Title } = Typography;

interface ArticleFilterProps {
    onSearch?: (params: articleParamsType) => void;
}

export const ArticleFilter = ({ onSearch }: ArticleFilterProps) => {
    const [searchSuggestions, setSearchSuggestions] = useState<articleType[]>([]);
    const [categories, setCategories] = useState<categoryType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // 获取分类列表
    const fetchCategories = async () => {
        try {
            const res = await categoryList();
            setCategories(res.data.list);
        } catch (error) {
            console.error('获取分类列表失败:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 处理搜索输入
    const handleSearchInput = async (value: string) => {
        if (!value.trim()) {
            setSearchSuggestions([]);
            return;
        }

        try {
            const params: articleParamsType = {
                page: 1,
                page_size: 5,
                key: value,
                category: selectedCategory === 'All' ? undefined : selectedCategory
            };
            const res = await articleList(params);
            setSearchSuggestions(res.data.list);
        } catch (error) {
            console.error('获取搜索建议失败:', error);
        }
    };

    // 处理搜索选择
    const handleSelect = (value: string, option: any) => {
        window.location.href = `/article/${option.key}`;
    };

    // 处理分类选择
    const handleCategorySelect = (category: string) => {
        const newCategory = category === 'All' ? undefined : category;
        setSelectedCategory(category);
        if (onSearch) {
            onSearch({
                page: 1,
                page_size: 10,
                category: newCategory
            });
        }
    };

    return (
        <div className="bg-white">
            {/* 搜索框区域 */}
            <div className="p-8 space-y-4">
                <AutoComplete
                    style={{ width: '100%' }}
                    onSearch={handleSearchInput}
                    onSelect={handleSelect}
                    dropdownStyle={{
                        maxHeight: '500px',
                        overflow: 'auto',
                        padding: '12px',
                        borderRadius: '0',
                        marginTop: '6px',
                        border: '1px solid #d9d9d9',
                        borderTop: '1px solid #d9d9d9'
                    }}
                    options={searchSuggestions.map(article => ({
                        label: (
                            <div style={{ padding: '8px' }}>
                                <div style={{
                                    fontSize: '15px',
                                    marginBottom: '4px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {article.title}
                                </div>
                            </div>
                        ),
                        value: article.title,
                        key: article.id
                    }))}
                >
                    <Input.Search
                        placeholder="搜索文章..."
                        allowClear
                        enterButton={<SearchOutlined className="text-lg" />}
                        size="large"
                        className="square-search-input"
                    />
                </AutoComplete>
            </div>

            {/* 分类列表区域 */}
            <div className="px-8 pb-8 pt-8">
                <h5 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">📑</span>分类
                </h5>
                <div className="space-y-2">
                    <div
                        className="px-6 py-3 cursor-pointer transition-all duration-300 text-gray-600 hover:bg-gray-50"
                        onClick={() => handleCategorySelect('All')}
                    >
                        <span className="text-base font-medium">全部</span>
                    </div>
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className="px-6 py-3 cursor-pointer transition-all duration-300 text-gray-600 hover:bg-gray-50"
                            onClick={() => handleCategorySelect(category.name)}
                        >
                            <span className="text-base font-medium">{category.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 