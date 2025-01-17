import { paramsType } from "@/api";
import {
  categoryCreate,
  categoryDelete,
  categoryList,
  categoryType,
} from "@/api/category";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Space,
  Table,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";

// 分页状态接口定义
interface PaginationState extends paramsType {
  total: number;
}

// 1. 抽取分页 Hook
const usePagination = (defaultPageSize = 10) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: defaultPageSize,
    total: 0,
  });

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
  };

  return { pagination, setPagination, handlePageChange };
};

// 2. 抽取表格列配置
const getCategoryColumns = (
  handleDelete: (id: number) => void
): ColumnsType<categoryType> => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "分类名称",
    dataIndex: "name",
    key: "name",
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
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      </Space>
    ),
  },
];

// 3. 抽取新建分类表单组件
const CategoryForm = ({ form }: { form: FormInstance }) => (
  <Form form={form} layout="vertical">
    <Form.Item
      label="分类名称"
      name="name"
      rules={[
        { required: true, message: "请输入分类名称" },
        { max: 50, message: "分类名称最多50个字符" },
      ]}>
      <Input placeholder="请输入分类名称" maxLength={50} showCount />
    </Form.Item>
  </Form>
);

export const AdminCategory = () => {
  // 4. 合并相关状态
  const [categoryState, setCategoryState] = useState({
    loading: false,
    data: [] as categoryType[],
    isModalVisible: false,
    submitLoading: false,
  });

  const [form] = Form.useForm();
  const { pagination, setPagination, handlePageChange } = usePagination();

  // 5. 使用 useCallback 优化方法
  const fetchData = useCallback(
    async (page = pagination.page, page_size = pagination.page_size) => {
      try {
        setCategoryState((prev) => ({ ...prev, loading: true }));
        const res = await categoryList({ page, page_size });

        if (res.code === 0) {
          setCategoryState((prev) => ({ ...prev, data: res.data.list }));
          setPagination((prev) => ({ ...prev, total: res.data.total }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        console.error("获取分类列表失败:", error);
        message.error("获取分类列表失败");
      } finally {
        setCategoryState((prev) => ({ ...prev, loading: false }));
      }
    },
    [pagination.page, pagination.page_size]
  );

  // 6. 优化删除处理
  const handleDelete = useCallback(
    (id: number) => {
      if (!id) return message.error("无效的分类ID");

      Modal.confirm({
        title: "确认删除",
        content: "确定要删除这个分类吗？删除后不可恢复。",
        okText: "确认",
        cancelText: "取消",
        onOk: async () => {
          try {
            const response = await categoryDelete(id);
            if (response.code === 0) {
              message.success("删除成功");
              fetchData(pagination.page, pagination.page_size);
            } else {
              message.error(response.message);
            }
          } catch (error) {
            console.error("删除分类错误:", error);
            message.error("删除失败");
          }
        },
      });
    },
    [pagination]
  );

  // 7. 优化表单提交
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setCategoryState((prev) => ({ ...prev, submitLoading: true }));

      const response = await categoryCreate(values);
      if (response.code === 0) {
        message.success("创建成功");
        setCategoryState((prev) => ({ ...prev, isModalVisible: false }));
        form.resetFields();
        fetchData(pagination.page, pagination.page_size);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("创建分类错误:", error);
      message.error("创建失败，请稍后重试");
    } finally {
      setCategoryState((prev) => ({ ...prev, submitLoading: false }));
    }
  }, [form, pagination]);

  // 8. 使用 useMemo 优化表格列配置
  const columns = useMemo(
    () => getCategoryColumns(handleDelete),
    [handleDelete]
  );

  useEffect(() => {
    fetchData(pagination.page, pagination.page_size);
  }, []);

  return (
    <div style={{ minHeight: "100%" }}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="m-0">分类管理</h2>
        <Button
          type="primary"
          onClick={() =>
            setCategoryState((prev) => ({ ...prev, isModalVisible: true }))
          }
          size="large"
          icon={<PlusOutlined />}>
          新建分类
        </Button>
      </div>

      <div className="p-6">
        <Table
          columns={columns}
          dataSource={categoryState.data}
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
          loading={categoryState.loading}
        />
      </div>

      <Modal
        title="新建分类"
        open={categoryState.isModalVisible}
        onCancel={() => {
          setCategoryState((prev) => ({ ...prev, isModalVisible: false }));
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCategoryState((prev) => ({ ...prev, isModalVisible: false }));
              form.resetFields();
            }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={categoryState.submitLoading}
            onClick={handleSubmit}>
            提交
          </Button>,
        ]}>
        <CategoryForm form={form} />
      </Modal>
    </div>
  );
};
