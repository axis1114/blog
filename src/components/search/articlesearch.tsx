import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { articleList, articleType, articleParamsType } from '../../api/article';
import { useState } from 'react';

export const ArticleSearch = () => {
    const [searchSuggestions, setSearchSuggestions] = useState<articleType[]>([]);

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
            };
            const res = await articleList(params);
            setSearchSuggestions(res.data.list);
        } catch (error) {
            console.error('获取搜索建议失败:', error);
        }
    };

    const handleSelect = (value: string, option: any) => {
        window.location.href = `/article/${option.key}`;
    };

    return (
        <div style={{ padding: '20px' }}>
            <AutoComplete
                style={{ width: '100%' }}
                onSearch={handleSearchInput}
                onSelect={handleSelect}
                dropdownStyle={{
                    maxHeight: '400px',
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
