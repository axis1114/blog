import { useEffect, useState } from 'react';
import { articleList, articleType, articleParamsType, } from '../../api/article';
import { Row, Col, List, Typography, Space, Tag } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title, Paragraph } = Typography;

// 扩展 articleParamsType 接口来包含总数
interface PaginationState extends Omit<articleParamsType, 'keyword'> {
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
        sort_order: undefined
    });
    const isDarkMode = useSelector((state: any) => state.web.theme.isDarkMode);

    const fetchArticles = async (page = pagination.page, pageSize = pagination.page_size) => {
        setLoading(true);
        try {
            const params: articleParamsType = {
                page,
                page_size: pageSize,
                category: pagination.category,
                sort_field: pagination.sort_field,
                sort_order: pagination.sort_order
            };
            const res = await articleList(params);
            setArticles(res.data.list);
            setPagination(prev => ({
                ...prev,
                total: res.data.total
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
        <Row gutter={24}>
            <Col span={18} style={{ padding: '0px 0px 0px 12px' }}>
                <List
                    loading={loading}
                    itemLayout="vertical"
                    dataSource={articles}
                    style={{
                        borderRight: `2px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                        backgroundColor: isDarkMode ? '#141414' : '#ffffff',
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
                            marginTop: '20px',
                            marginBottom: '20px',
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
                                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                                '&:hover': {
                                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
                                }
                            }}
                        >
                            {/* 主要内容区域 */}
                            <div style={{ display: 'flex', gap: '32px' }}>
                                {/* 左侧：文章主体内容 */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* 标题和分类 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <a href={`/article/${item.id}`}
                                            style={{
                                                flex: 1,
                                                color: isDarkMode ? '#e6e6e6' : 'inherit',
                                            }}
                                        >
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
                                            color={isDarkMode ? 'dark' : 'default'}
                                            style={{
                                                marginLeft: '20px',
                                                fontSize: '15px',
                                                padding: '6px 20px',
                                                backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
                                                border: 'none'
                                            }}
                                        >
                                            {item.category}
                                        </Tag>
                                    </div>

                                    {/* 摘要 */}
                                    <Paragraph
                                        type="secondary"
                                        ellipsis={{ rows: 2 }}
                                        style={{
                                            color: isDarkMode ? '#8c8c8c' : '#595959',
                                            fontSize: '18px',
                                            lineHeight: 1.8,
                                            margin: 0
                                        }}
                                    >
                                        {item.abstract}
                                    </Paragraph>

                                    {/* 底部信息栏 */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 'auto'
                                    }}>
                                        {/* 作者和日期 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <span style={{
                                                color: isDarkMode ? '#a6a6a6' : '#595959',
                                                fontSize: '18px',
                                                fontWeight: 500
                                            }}>
                                                {item.user_name}
                                            </span>
                                            <span style={{
                                                color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
                                                fontSize: '17px'
                                            }}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* 文章数据 */}
                                        <div style={{ display: 'flex', gap: '32px' }}>
                                            <Space size={12}>
                                                <EyeOutlined style={{ fontSize: '20px' }} />
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 500,
                                                    color: isDarkMode ? '#a6a6a6' : '#595959'
                                                }}>
                                                    {item.look_count}
                                                </span>
                                            </Space>
                                            <Space size={12}>
                                                <LikeOutlined style={{ fontSize: '20px' }} />
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 500,
                                                    color: isDarkMode ? '#a6a6a6' : '#595959'
                                                }}>
                                                    {item.digg_count}
                                                </span>
                                            </Space>
                                            <Space size={12}>
                                                <MessageOutlined style={{ fontSize: '20px' }} />
                                                <span style={{
                                                    fontSize: '20px',
                                                    fontWeight: 500,
                                                    color: isDarkMode ? '#a6a6a6' : '#595959'
                                                }}>
                                                    {item.comment_count}
                                                </span>
                                            </Space>
                                        </div>
                                    </div>
                                </div>

                                {/* 右侧：封面图片 */}
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

            <Col span={6} style={{ backgroundColor: isDarkMode ? '#141414' : '#ffffff' }}>
            </Col>
        </Row>
    );
};
