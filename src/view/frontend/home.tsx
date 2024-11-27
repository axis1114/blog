import { useEffect, useState } from 'react';
import { articleList, articleType, articleParamsType, } from '../../api/article';
import { Row, Col, List, Typography, Space, Tag } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { ArticleFilter } from '../../components/search/articlefilter';
import { FriendLinkList } from '../../components/friendlink/friendlink';

const { Title, Paragraph } = Typography;


interface PaginationState extends articleParamsType {
    total: number;
}



export const WebHome = () => {
    const [articles, setArticles] = useState<articleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        page_size: 10,
        total: 0,
        category: undefined,
        sort_field: undefined,
        sort_order: undefined,
        key: undefined
    });

    const fetchArticles = async (page = pagination.page, pageSize = pagination.page_size, category?: string) => {
        setLoading(true);
        try {
            const params: articleParamsType = {
                page,
                page_size: pageSize,
                category: category === undefined ? undefined : category,
                sort_field: pagination.sort_field,
                sort_order: pagination.sort_order,
                key: pagination.key
            };
            const res = await articleList(params);
            setArticles(res.data.list);
            setPagination(prev => ({
                ...prev,
                total: res.data.total,
                category: category
            }));
        } catch (error) {
            console.error('获取文章列表失败:', error);
        }
        setLoading(false);
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination(prev => ({
            ...prev,
            page,
            page_size: pageSize || prev.page_size
        }));
        fetchArticles(page, pageSize);
    };

    useEffect(() => {
        fetchArticles();
    }, []);
    return (
        <div className="flex justify-center w-full bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-[1500px] w-full px-4">
                <Row gutter={24}>
                    <Col span={19}>
                        <List
                            loading={loading}
                            itemLayout="vertical"
                            dataSource={articles}
                            className="bg-white border border-gray-100/80 hover:shadow-md transition-shadow duration-300"
                            pagination={{
                                current: pagination.page,
                                pageSize: pagination.page_size,
                                total: pagination.total,
                                onChange: handlePageChange,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条`,
                                className: "text-center py-8 flex justify-center border-t border-gray-200"
                            }}
                            renderItem={(item) => (
                                <List.Item
                                    key={item.id}
                                    className="px-10 py-8 border-b border-gray-100 last:border-b-0 hover:bg-purple-50/30 transition-colors duration-300"
                                >
                                    <div className="flex gap-12">
                                        <div className="flex-1 flex flex-col gap-6 p-5">
                                            <div className="flex justify-between items-start gap-6">
                                                <a href={`/article/${item.id}`} className="group">
                                                    <Title level={5} className="!m-0 text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                                                        {item.title}
                                                    </Title>
                                                </a>
                                                <Tag className="!m-0 px-4 py-1.5 text-sm font-medium border-2 border-gray-200">
                                                    {item.category}
                                                </Tag>
                                            </div>

                                            <Paragraph
                                                type="secondary"
                                                ellipsis={{ rows: 2 }}
                                                className="!m-0 text-gray-500 text-base leading-relaxed"
                                            >
                                                {item.abstract}
                                            </Paragraph>

                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex items-center gap-6">
                                                    <div className="border border-gray-200 px-4 py-1.5 bg-gray-50">
                                                        <span className="text-gray-600 text-sm">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <div className="flex items-center border border-gray-200 px-4 py-1.5 bg-gray-50 hover:bg-white hover:border-purple-200 hover:text-purple-600 transition-all">
                                                        <EyeOutlined className="text-gray-400 group-hover:text-purple-500" />
                                                        <span className="ml-2.5 text-gray-600">{item.look_count}</span>
                                                    </div>
                                                    <div className="flex items-center border border-gray-200 px-4 py-1.5 bg-gray-50 hover:bg-white hover:border-purple-200 hover:text-purple-600 transition-all">
                                                        <MessageOutlined className="text-gray-400 group-hover:text-purple-500" />
                                                        <span className="ml-2.5 text-gray-600">{item.comment_count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {item.cover_url && (
                                            <div className="flex-shrink-0 w-56 h-40 overflow-hidden border border-gray-200 group">
                                                <img
                                                    src={item.cover_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col span={5}>
                        <div className="space-y-8">
                            <div className="bg-white shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-300">
                                <ArticleFilter
                                    onSearch={(params) => {
                                        setPagination(prev => ({
                                            ...prev,
                                            ...params,
                                            page: 1
                                        }));
                                        fetchArticles(1, pagination.page_size, params.category);
                                    }}
                                />
                            </div>
                            <div className="bg-white shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow duration-300">
                                <FriendLinkList />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};
