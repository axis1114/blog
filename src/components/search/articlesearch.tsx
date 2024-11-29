import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { articleList, articleType, articleParamsType } from '../../api/article';
import { useState } from 'react';

export const ArticleSearch = () => {
    const [searchSuggestions, setSearchSuggestions] = useState<articleType[]>([]);

    // 处理搜索框输入，获取搜索建议
    const handleSearchInput = async (value: string) => {
        if (!value.trim()) {
            setSearchSuggestions([]);
            return;
        }

        try {
            // 构建搜索参数
            const params: articleParamsType = {
                page: 1,
                page_size: 5,
                key: value,
            };
            const res = await articleList(params);
            if (res.code === 2000) {
                setSearchSuggestions(res.data.list);
            }
        } catch (error) {
            console.error('获取搜索建议失败:', error);
        }
    };

    // 处理搜索建议选择，跳转到文章详情
    const handleSelect = (_: string, option: any) => {
        window.location.href = `/article/${option.key}`;
    };

    return (
        <div className="p-8">
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
                    enterButton={<SearchOutlined />}
                    size="large"
                    className="square-search-input"
                />
            </AutoComplete>
        </div>
    );
};
