import { useEffect, useState } from 'react';
import { articleList, articleType, articleParamsType, } from '../../api/article';
import { Row, Col, List, Typography, Space, Tag } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { ArticleFilter } from '../../components/search/ArticleFilter';
import { FriendLinkList } from '../../components/friendlink/friendlink';

const { Title, Paragraph } = Typography;

// 扩展 articleParamsType 接口来包含总数
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
        <Row gutter={24} className="px-[60px]">
            <Col span={18}>
                <List
                    loading={loading}
                    itemLayout="vertical"
                    dataSource={articles}
                    style={{
                        borderRight: '2px solid #f0f0f0',
                        backgroundColor: '#ffffff',
                    }}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.page_size,
                        total: pagination.total,
                        onChange: handlePageChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                        style: {
                            textAlign: 'center',
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'center'
                        },
                    }}
                    renderItem={(item) => (
                        <List.Item
                            key={item.id}
                            style={{
                                padding: '28px 32px',
                                transition: 'all 0.3s ease',
                                borderBottom: '2px solid #f0f0f0',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '32px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <a href={`/article/${item.id}`} style={{ flex: 1, color: 'inherit' }}>
                                            <Title level={5} style={{
                                                margin: 0,
                                                fontSize: '22px',
                                                fontWeight: 600,
                                                lineHeight: 1.4
                                            }}>
                                                {item.title}
                                            </Title>
                                        </a>
                                        <Tag
                                            color="default"
                                            style={{
                                                marginLeft: '20px',
                                                fontSize: '15px',
                                                padding: '6px 20px',
                                                backgroundColor: '#f5f5f5',
                                                border: 'none'
                                            }}
                                        >
                                            {item.category}
                                        </Tag>
                                    </div>

                                    <Paragraph
                                        type="secondary"
                                        ellipsis={{ rows: 2 }}
                                        style={{
                                            color: '#595959',
                                            fontSize: '18px',
                                            lineHeight: 1.8,
                                            margin: 0
                                        }}
                                    >
                                        {item.abstract}
                                    </Paragraph>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 'auto'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <span style={{
                                                color: '#595959',
                                                fontSize: '18px',
                                                fontWeight: 500
                                            }}>
                                                {item.user_name}
                                            </span>
                                            <span style={{
                                                color: '#8c8c8c',
                                                fontSize: '17px'
                                            }}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '32px' }}>
                                            <Space size={12}>
                                                <EyeOutlined style={{ fontSize: '20px' }} />
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 500,
                                                    color: '#595959'
                                                }}>
                                                    {item.look_count}
                                                </span>
                                            </Space>
                                            <Space size={12}>
                                                <LikeOutlined style={{ fontSize: '20px' }} />
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 500,
                                                    color: '#595959'
                                                }}>
                                                    {item.digg_count}
                                                </span>
                                            </Space>
                                            <Space size={12}>
                                                <MessageOutlined style={{ fontSize: '20px' }} />
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 500,
                                                    color: '#595959'
                                                }}>
                                                    {item.comment_count}
                                                </span>
                                            </Space>
                                        </div>
                                    </div>
                                </div>

                                {item.cover_url && (
                                    <div style={{
                                        flexShrink: 0,
                                        width: '240px',
                                        height: '160px',
                                        overflow: 'hidden',
                                    }}>
                                        <img
                                            src={item.cover_url}
                                            alt={item.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </List.Item>
                    )}
                />
            </Col>

            <Col span={6} style={{ backgroundColor: '#ffffff', padding: '0px' }}>
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
                <FriendLinkList />
            </Col>
        </Row>
    );
};
