import { useEffect, useState } from 'react';

import { Table, Button, Modal, Form, Input, message, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";
import { imageList, imageType } from '@/api/image';
import { articleType, articleList, articleDelete, articleUpdate, articleCreate } from '@/api/article';
import { ColumnsType } from 'antd/es/table';
import { categoryList, categoryType } from '@/api/category';

const mdParser = new MarkdownIt();

export const AdminArticle = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<articleType[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [content, setContent] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [images, setImages] = useState<imageType[]>([]);
    const [selectedCoverId, setSelectedCoverId] = useState<number>();
    const [editingArticle, setEditingArticle] = useState<articleType | null>(null);
    const [categories, setCategories] = useState<categoryType[]>([]);

    // 获取文章列表
    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const res = await articleList({
                page,
                page_size: pagination.pageSize,
            });
            if (res.code === 2000) {
                setData(res.data.list);
                setPagination({
                    ...pagination,
                    current: page,
                    total: res.data.total,
                });
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            console.error('获取文章列表失败:', error);
            message.error("获取文章列表失败");
        } finally {
            setLoading(false);
        }
    };

    // 删除文章
    const handleDelete = async (id: string[]) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这篇文章吗？删除后不可恢复。',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const response = await articleDelete({ id_list: id });
                    if (response.code === 2000) {
                        message.success("删除成功");
                        fetchData(pagination.current);
                    } else {
                        message.error(response.msg);
                    }
                } catch (error: any) {
                    console.error('删除文章失败:', error);
                    message.error(error.message);
                }
            }
        });
    };

    // 打开弹框
    const showModal = (record?: articleType) => {
        setIsModalVisible(true);
        form.resetFields();
        setContent("");
        setSelectedCoverId(undefined);

        if (record) {
            setEditingArticle(record);
            form.setFieldsValue({
                title: record.title,
                category: record.category,
                cover_id: record.cover_id,
            });
            setContent(record.content);
            setSelectedCoverId(record.cover_id);
        } else {
            setEditingArticle(null);
        }
    };

    // 关闭弹框
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setContent("");
        setEditingArticle(null);
        setSelectedCoverId(undefined);
    };

    // 获取图片列表
    const fetchImages = async () => {
        try {
            const res = await imageList({ page: 1, page_size: 20 });
            if (res.code === 2000) {
                setImages(res.data.list);
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            console.error('获取图片列表失败:', error);
            message.error('获取图片列表失败');
        }
    };

    // 获取分类列表
    const fetchCategories = async () => {
        try {
            const res = await categoryList();
            if (res.code === 2000) {
                setCategories(res.data.list);
            } else {
                message.error('获取分类列表失败');
            }
        } catch (error) {
            console.error('获取分类列表失败:', error);
            message.error('获取分类列表失败');
        }
    };

    // 在组件加载时获取图片列表
    useEffect(() => {
        fetchData();
        fetchImages();
        fetchCategories();
    }, []);

    // 选择封面图片
    const handleSelectCover = (imageId: number) => {
        setSelectedCoverId(imageId);
        form.setFieldValue('cover_id', imageId);
    };

    // 提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!content) {
                message.error("请输入文章内容");
                return;
            }
            if (!selectedCoverId) {
                message.error("请选择文章封面");
                return;
            }

            setSubmitLoading(true);
            const submitData = {
                ...values,
                content,
                abstract: content.substring(0, 100),
                cover_id: selectedCoverId,
            };

            if (editingArticle) {
                // 编辑模式
                await articleUpdate({
                    ...submitData,
                    id: editingArticle.id,
                });
                message.success("更新成功");
            } else {
                // 创建模式
                await articleCreate(submitData);
                message.success("创建成功");
            }

            handleCancel();
            fetchData(pagination.current);
        } catch (error) {
            console.error('提交表单失败:', error);
            message.error(editingArticle ? "更新失败" : "创建失败");
        } finally {
            setSubmitLoading(false);
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
                    <Button type="link" onClick={() => showModal(record)}>
                        编辑
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete([record.id])}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ minHeight: '100%' }}>
            {/* 头部区域 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid #f0f0f0',
            }}>
                <h2 style={{ margin: 0 }}>文章管理</h2>
                <Button
                    type="primary"
                    onClick={() => showModal()}
                    size="large"
                    icon={<PlusOutlined />}
                >
                    新建文章
                </Button>
            </div>

            {/* 表格区域 */}
            <div style={{ padding: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={(pagination) => fetchData(pagination.current)}
                />
            </div>

            {/* 模态框 */}
            <Modal
                title={editingArticle ? "编辑文章" : "新建文章"}
                open={isModalVisible}
                onCancel={handleCancel}
                width={1000}
                // 添加 Tailwind 类名来控制 z-index
                className="article-modal [&_.ant-modal-close]:z-[999]"
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={submitLoading}
                        onClick={handleSubmit}
                    >
                        提交
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}  // 添加表单提交处理
                >
                    <Form.Item
                        label="文章标题"
                        name="title"
                        rules={[
                            { required: true, message: "请输入文章标题" },
                            { max: 100, message: "标题最多100个字符" }
                        ]}
                    >
                        <Input
                            placeholder="请输入文章标题"
                            maxLength={100}
                            showCount  // 显示字数统计
                        />
                    </Form.Item>

                    <Form.Item
                        label="文章分类"
                        name="category"
                        rules={[
                            { required: true, message: "请选择文章分类" },
                        ]}
                    >
                        <Select
                            placeholder='请选择文章分类'
                            options={categories.map(cat => ({
                                label: cat.name,
                                value: cat.name
                            }))}
                        />
                    </Form.Item>

                    {/* 封面选择区域 */}
                    <Form.Item
                        label="文章封面"
                        name="cover_id"
                        rules={[{ required: true, message: '请选择文章封面' }]}
                    >
                        <div className="flex flex-col gap-4">
                            {/* 图片列表容器 */}
                            <div className="flex flex-wrap gap-4 min-h-[100px] p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                {images.length > 0 ? (
                                    images.map((image) => (
                                        <div
                                            key={image.id}
                                            onClick={() => handleSelectCover(image.id)}
                                            className={`
                                                relative w-24 h-24 cursor-pointer rounded-lg overflow-hidden
                                                ${selectedCoverId === image.id
                                                    ? 'ring-2 ring-blue-500 ring-offset-2'
                                                    : 'border border-gray-200 hover:border-blue-300'}
                                                transition-all duration-200 group
                                            `}
                                        >
                                            <img
                                                src={image.path}
                                                alt={image.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            {/* 选中状态遮罩 */}
                                            {selectedCoverId === image.id && (
                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                    <div className="bg-white rounded-full p-1">
                                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    // 无图片时的提示
                                    <div className="w-full h-32 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>暂无可选择的图片</span>
                                    </div>
                                )}
                            </div>

                            {/* 提示文本 */}
                            <div className="text-sm text-gray-500">
                                点击图片选择作为文章封面，建议尺寸 16:9
                            </div>
                        </div>
                    </Form.Item>

                    {/* Markdown 编辑器 */}
                    <Form.Item label="文章内容">
                        <div className="[&_.rc-md-editor.full]:!z-[1000]">
                            <MdEditor
                                style={{ height: "400px" }}
                                renderHTML={(text) => mdParser.render(text)}
                                onChange={({ text }) => setContent(text)}
                                value={content}
                            />
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
