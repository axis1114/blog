import { Button, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import { articleDelete, articleList, articleType } from "../../api/article";
import type { ColumnsType } from "antd/es/table";

export const AdminArticle = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<articleType[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 获取文章列表
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await articleList({
                page,
                page_size: pagination.pageSize,
            });
            setData(res.data.list);
            setPagination({
                ...pagination,
                current: page,
                total: res.data.total,
            });
        } catch (error) {
            message.error("获取文章列表失败");
        }
        setLoading(false);
    };

    // 删除文章
    const handleDelete = async (id: string) => {
        try {
            await articleDelete(id);
            message.success("删除成功");
            fetchData(pagination.current);
        } catch (error) {
            message.error("删除失败");
        }
    };

    const columns: ColumnsType<articleType> = [
        {
            title: "标题",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "分类",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "浏览量",
            dataIndex: "look_count",
            key: "look_count",
        },
        {
            title: "评论数",
            dataIndex: "comment_count",
            key: "comment_count",
        },
        {
            title: "创建时间",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link">编辑</Button>
                    <Button 
                        type="link" 
                        danger 
                        onClick={() => handleDelete(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="admin_article">
            <div style={{ marginBottom: 16 }}>
                <Button type="primary">新建文章</Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={(pagination) => fetchData(pagination.current)}
            />
        </div>
    );
};
