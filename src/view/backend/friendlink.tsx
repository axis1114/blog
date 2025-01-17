import { paramsType } from "@/api";
import {
  friendlinkCreate,
  friendlinkDelete,
  friendlinkList,
  friendlinkType,
} from "@/api/friendlink";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Table,
  FormInstance,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
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
const getFriendlinkColumns = (
  handleDelete: (id: number) => void
): ColumnsType<friendlinkType> => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "链接",
    dataIndex: "link",
    key: "link",
    render: (text) => (
      <a href={text} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    ),
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "更新时间",
    dataIndex: "updated_at",
    key: "updated_at",
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

// 3. 抽取表单组件
const FriendlinkForm = ({ form }: { form: FormInstance }) => (
  <Form form={form} layout="vertical">
    <Form.Item
      label="名称"
      name="name"
      rules={[{ max: 50, message: "名称最多50个字符" }]}>
      <Input placeholder="请输入友链名称" maxLength={50} showCount />
    </Form.Item>

    <Form.Item
      label="链接"
      name="link"
      rules={[{ type: "url", message: "请输入有效的URL地址" }]}>
      <Input placeholder="请输入友链地址，例如：https://example.com" />
    </Form.Item>
  </Form>
);

export const AdminFriendlink = () => {
  // 4. 合并相关状态
  const [state, setState] = useState({
    loading: false,
    data: [] as friendlinkType[],
    isModalVisible: false,
    submitLoading: false,
  });

  const [form] = Form.useForm();
  const { pagination, setPagination, handlePageChange } = usePagination();

  // 5. 使用 useCallback 优化方法
  const fetchData = useCallback(
    async (page = pagination.page, page_size = pagination.page_size) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const res = await friendlinkList({ page, page_size });

        if (res.code === 0) {
          setState((prev) => ({ ...prev, data: res.data.list }));
          setPagination((prev) => ({ ...prev, total: res.data.total }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        message.error("获取友情链接列表失败");
        console.error("获取友情链接列表失败:", error);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [pagination]
  );

  const handleDelete = useCallback(
    (id: number) => {
      Modal.confirm({
        title: "确认删除",
        content: "确定要删除这个友情链接吗？删除后不可恢复。",
        okText: "确认",
        cancelText: "取消",
        onOk: async () => {
          try {
            const response = await friendlinkDelete(id);
            if (response.code === 0) {
              message.success("删除成功");
              fetchData(pagination.page, pagination.page_size);
            } else {
              message.error(response.message);
            }
          } catch (error) {
            message.error("删除失败");
            console.error("删除失败:", error);
          }
        },
      });
    },
    [pagination]
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setState((prev) => ({ ...prev, submitLoading: true }));

      const res = await friendlinkCreate(values);
      if (res.code === 0) {
        message.success("创建成功");
        setState((prev) => ({ ...prev, isModalVisible: false }));
        form.resetFields();
        fetchData(pagination.page, pagination.page_size);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("创建失败");
      console.error("创建失败:", error);
    } finally {
      setState((prev) => ({ ...prev, submitLoading: false }));
    }
  }, [form, pagination]);

  // 6. 使用 useMemo 优化表格列配置
  const columns = useMemo(
    () => getFriendlinkColumns(handleDelete),
    [handleDelete]
  );

  useEffect(() => {
    fetchData();
  }, []);

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="m-0">友情链接管理</h2>
        <Button
          type="primary"
          onClick={() =>
            setState((prev) => ({ ...prev, isModalVisible: true }))
          }
          size="large"
          icon={<PlusOutlined />}>
          新建友链
        </Button>
      </div>

      <div className="p-6">
        <Table
          columns={columns}
          dataSource={state.data}
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
          loading={state.loading}
        />
      </div>

      <Modal
        title="新建友情链接"
        open={state.isModalVisible}
        onCancel={() => {
          setState((prev) => ({ ...prev, isModalVisible: false }));
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setState((prev) => ({ ...prev, isModalVisible: false }));
              form.resetFields();
            }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={state.submitLoading}
            onClick={handleSubmit}>
            提交
          </Button>,
        ]}>
        <FriendlinkForm form={form} />
      </Modal>
    </div>
  );
};
