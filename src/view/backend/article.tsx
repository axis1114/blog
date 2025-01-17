import { paramsType } from "@/api";
import {
  articleCreate,
  articleDelete,
  articleList,
  articleType,
  articleUpdate,
} from "@/api/article";
import { categoryList } from "@/api/category";
import { imageList, imageType } from "@/api/image";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import { ColumnsType } from "antd/es/table";
import MarkdownIt from "markdown-it";
import { useCallback, useEffect, useMemo, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

interface PaginationState extends paramsType {
  total: number;
}

const mdParser = new MarkdownIt();

// 1. 将分页相关的逻辑抽离为自定义 Hook
const useArticlePagination = (fetchData: Function) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
  });

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
    fetchData(page, pageSize);
  };

  return { pagination, setPagination, handlePageChange };
};

// 2. 将表格列配置抽离出来
const getArticleColumns = (
  onEdit: (record: articleType) => void,
  onDelete: (id: string[]) => void
): ColumnsType<articleType> => [
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
        <Button type="link" onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Button type="link" danger onClick={() => onDelete([record.id])}>
          删除
        </Button>
      </Space>
    ),
  },
];

export const AdminArticle = () => {
  const [form] = Form.useForm();

  // 1. 先定义 articleState
  const [articleState, setArticleState] = useState({
    loading: false,
    data: [] as articleType[],
    content: "",
    submitLoading: false,
    editingArticle: null as articleType | null,
    isModalVisible: false,
  });

  // 2. 先声明 fetchData
  const fetchData = useCallback(async (page: number, page_size: number) => {
    try {
      setArticleState((prev) => ({ ...prev, loading: true }));
      const res = await articleList({ page, page_size });

      if (res.code === 0) {
        setArticleState((prev) => ({
          ...prev,
          data: res.data.list,
        }));
        setPagination((prev) => ({
          ...prev,
          total: res.data.total,
        }));
      }
    } catch (error) {
      message.error("获取文章列表失败");
    } finally {
      setArticleState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // 3. 然后使用 pagination hook
  const { pagination, setPagination, handlePageChange } =
    useArticlePagination(fetchData);

  // 5. 优化图片相关状态
  const [imageState, setImageState] = useState({
    images: [] as imageType[],
    loading: false,
    selectedCoverId: undefined as number | undefined,
    pagination: {
      page: 1,
      page_size: 20,
      hasMore: true,
    },
  });

  // 7. 优化 Modal 相关操作
  const handleModal = useCallback(
    (record?: articleType) => {
      setArticleState((prev) => ({
        ...prev,
        isModalVisible: true,
        editingArticle: record || null,
        content: record?.content || "",
      }));

      form.resetFields();
      if (record) {
        form.setFieldsValue({
          title: record.title,
          category: record.category,
          cover_id: record.cover_id,
        });
        setImageState((prev) => ({
          ...prev,
          selectedCoverId: record.cover_id,
        }));
      }
    },
    [form]
  );

  // 8. 优化提交处理
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (!articleState.content) {
        return message.error("请输入文章内容");
      }
      if (!imageState.selectedCoverId) {
        return message.error("请选择文章封面");
      }

      setArticleState((prev) => ({ ...prev, submitLoading: true }));

      const submitData = {
        ...values,
        content: articleState.content,
        abstract: articleState.content.substring(0, 100),
        cover_id: imageState.selectedCoverId,
      };

      if (articleState.editingArticle) {
        await articleUpdate({
          ...submitData,
          id: articleState.editingArticle.id,
        });
      } else {
        await articleCreate(submitData);
      }

      message.success(articleState.editingArticle ? "更新成功" : "创建成功");
      handleCancel();
      fetchData(pagination.page || 1, pagination.page_size || 10);
    } catch (error) {
      message.error(articleState.editingArticle ? "更新失败" : "创建失败");
    } finally {
      setArticleState((prev) => ({ ...prev, submitLoading: false }));
    }
  }, [
    articleState.content,
    articleState.editingArticle,
    imageState.selectedCoverId,
    form,
  ]);

  const handleDelete = async (id: string[]) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这篇文章吗？删除后不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await articleDelete({ id_list: id });
          if (response.code === 0) {
            message.success("删除成功");
            fetchData(pagination.page || 1, pagination.page_size || 10);
          } else {
            message.error(response.message);
          }
        } catch (error: any) {
          console.error("删除文章失败:", error);
          message.error(error.message);
        }
      },
    });
  };

  const handleCancel = () => {
    setArticleState((prev) => ({
      ...prev,
      isModalVisible: false,
      editingArticle: null,
      content: "",
    }));
    form.resetFields();
    setImageState((prev) => ({
      ...prev,
      selectedCoverId: undefined,
    }));
  };

  const fetchImages = async (page = 1) => {
    try {
      setImageState((prev) => ({ ...prev, loading: true }));
      const res = await imageList({
        page,
        page_size: imageState.pagination.page_size,
      });
      if (res.code === 0) {
        setImageState((prev) => ({
          ...prev,
          images:
            page === 1 ? res.data.list : [...prev.images, ...res.data.list],
          pagination: {
            ...prev.pagination,
            page,
            hasMore: res.data.list.length === prev.pagination.page_size,
          },
        }));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("获取图片列表失败:", error);
      message.error("获取图片列表失败");
    } finally {
      setImageState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryList({ page: 1, page_size: 999 });
      if (res.code === 0) {
        setCategories(res.data.list);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("获取分类列表失败:", error);
      message.error("获取分类列表失败");
    }
  };

  useEffect(() => {
    fetchData(pagination.page || 1, pagination.page_size || 10);
    fetchImages();
    fetchCategories();
  }, []);

  const handleSelectCover = (imageId: number) => {
    setImageState((prev) => ({
      ...prev,
      selectedCoverId: imageId,
    }));
    form.setFieldValue("cover_id", imageId);
  };

  const columns = useMemo(
    () => getArticleColumns(handleModal, handleDelete),
    []
  );

  const [categories, setCategories] = useState<any[]>([]);

  if (articleState.loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%" }}>
      {/* 头部区域 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}>
        <h2 style={{ margin: 0 }}>文章管理</h2>
        <Button
          type="primary"
          onClick={() => handleModal()}
          size="large"
          icon={<PlusOutlined />}>
          新建文章
        </Button>
      </div>

      {/* 表格区域 */}
      <div style={{ padding: "24px" }}>
        <Table
          columns={columns}
          dataSource={articleState.data}
          rowKey="id"
          pagination={{
            position: ["bottomCenter"],
            current: pagination.page,
            pageSize: pagination.page_size,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            className: "py-8",
          }}
          loading={articleState.loading}
        />
      </div>

      <Modal
        title={articleState.editingArticle ? "编辑文章" : "新建文章"}
        open={articleState.isModalVisible}
        onCancel={handleCancel}
        width={1000}
        className="article-modal [&_.ant-modal-close]:z-[999]"
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={articleState.submitLoading}
            onClick={handleSubmit}>
            提交
          </Button>,
        ]}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="文章标题"
            name="title"
            rules={[
              { required: true, message: "请输入文章标题" },
              { max: 100, message: "标题最多100个字符" },
            ]}>
            <Input placeholder="请输入文章标题" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            label="文章分类"
            name="category"
            rules={[{ required: true, message: "请选择文章分类" }]}>
            <Select
              placeholder="请选择文章分类"
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="文章封面"
            name="cover_id"
            rules={[{ required: true, message: "请选择文章封面" }]}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto">
                <div
                  className="flex flex-wrap gap-8 p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300"
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } =
                      e.currentTarget;
                    if (
                      scrollHeight - scrollTop - clientHeight < 50 &&
                      !imageState.loading &&
                      imageState.pagination.hasMore
                    ) {
                      fetchImages(imageState.pagination.page + 1);
                    }
                  }}>
                  {imageState.images.length > 0 ? (
                    <>
                      {imageState.images.map((image) => (
                        <div
                          key={image.id}
                          onClick={() => handleSelectCover(image.id)}
                          className={`
                            relative w-48 h-27 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden
                            ${
                              imageState.selectedCoverId === image.id
                                ? "ring-2 ring-blue-500 ring-offset-2"
                                : "border border-gray-200 hover:border-blue-300"
                            }
                            transition-all duration-200 group
                          `}>
                          <img
                            src={image.path}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {imageState.selectedCoverId === image.id && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-white rounded-full p-1">
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {imageState.loading && (
                        <div className="w-full flex justify-center p-5">
                          <Spin />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center text-gray-400">
                      <svg
                        className="w-8 h-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>暂无可选择的图片</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Form.Item>

          {/* Markdown 编辑器 */}
          <Form.Item label="文章内容">
            <div className="[&_.rc-md-editor.full]:!z-[1000]">
              <MdEditor
                style={{ height: "400px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) =>
                  setArticleState((prev) => ({ ...prev, content: text }))
                }
                value={articleState.content}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
