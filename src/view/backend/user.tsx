import { paramsType } from "@/api";
import { userCreate, userDelete, userInfoType, userList } from "@/api/user";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  FormInstance,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
interface PaginationState extends paramsType {
  total: number;
}

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

const getUserColumns = (
  onEdit: (record: userInfoType) => void,
  onDelete: (id: number) => void
): ColumnsType<userInfoType> => [
  {
    title: "用户ID",
    dataIndex: "id",
    key: "id",
    width: "8%",
  },
  {
    title: "昵称",
    dataIndex: "nick_name",
    key: "nick_name",
  },
  {
    title: "账号",
    dataIndex: "account",
    key: "account",
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "地址",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "角色",
    dataIndex: "role",
    key: "role",
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
        <Button type="link" danger onClick={() => onDelete(record.id)}>
          删除
        </Button>
      </Space>
    ),
  },
];

const UserForm = ({
  form,
  editingUser,
}: {
  form: FormInstance;
  editingUser: userInfoType | null;
}) => (
  <Form form={form} layout="vertical">
    <Form.Item
      name="nick_name"
      label="昵称"
      rules={[
        { required: true, message: "请输入昵称" },
        { max: 50, message: "昵称最多50个字符" },
      ]}>
      <Input placeholder="请输入昵称" />
    </Form.Item>

    {!editingUser && (
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: "请输入密码" },
          { min: 6, message: "密码至少6个字符" },
          { max: 20, message: "密码最多20个字符" },
        ]}>
        <Input.Password placeholder="请输入密码" />
      </Form.Item>
    )}

    <Form.Item
      name="role"
      label="角色"
      rules={[{ required: true, message: "请输入角色" }]}>
      <Input placeholder="请输入角色" />
    </Form.Item>
  </Form>
);

export const AdminUser = () => {
  const [state, setState] = useState({
    loading: false,
    data: [] as userInfoType[],
    isModalVisible: false,
    submitLoading: false,
    editingUser: null as userInfoType | null,
  });

  const [form] = Form.useForm();
  const { pagination, setPagination, handlePageChange } = usePagination();

  const fetchUsers = useCallback(
    async (page = pagination.page, page_size = pagination.page_size) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const res = await userList({ page, page_size });

        if (res.code === 0) {
          setState((prev) => ({ ...prev, data: res.data.list }));
          setPagination((prev) => ({ ...prev, total: res.data.total }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        console.error("获取用户列表失败:", error);
        message.error("获取用户列表失败");
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
        content: "确定要删除这个用户吗？删除后不可恢复。",
        okText: "确认",
        cancelText: "取消",
        onOk: async () => {
          try {
            const res = await userDelete(id);
            if (res.code === 0) {
              message.success("删除成功");
              fetchUsers(pagination.page, pagination.page_size);
            } else {
              message.error(res.message);
            }
          } catch (error) {
            console.error("删除用户失败:", error);
            message.error("删除失败");
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

      const res = await userCreate(values);
      if (res.code === 0) {
        message.success("创建成功");
        setState((prev) => ({
          ...prev,
          isModalVisible: false,
          editingUser: null,
        }));
        form.resetFields();
        fetchUsers(pagination.page, pagination.page_size);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("创建用户失败:", error);
      message.error("创建失败");
    } finally {
      setState((prev) => ({ ...prev, submitLoading: false }));
    }
  }, [form, pagination]);

  const showModal = useCallback(
    (record?: userInfoType) => {
      form.resetFields();
      if (record) {
        setState((prev) => ({ ...prev, editingUser: record }));
        form.setFieldsValue({
          nick_name: record.nick_name,
          account: record.account,
          email: record.email,
          address: record.address,
          role: record.role,
        });
      }
      setState((prev) => ({
        ...prev,
        isModalVisible: true,
        editingUser: record || null,
      }));
    },
    [form]
  );

  const columns = useMemo(
    () => getUserColumns(showModal, handleDelete),
    [showModal, handleDelete]
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-full">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="m-0">用户管理</h2>
        <Button
          type="primary"
          onClick={() => showModal()}
          size="large"
          icon={<PlusOutlined />}>
          新建用户
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
        title={state.editingUser ? "编辑用户" : "新建用户"}
        open={state.isModalVisible}
        onCancel={() => {
          setState((prev) => ({
            ...prev,
            isModalVisible: false,
            editingUser: null,
          }));
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setState((prev) => ({
                ...prev,
                isModalVisible: false,
                editingUser: null,
              }));
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
        <UserForm form={form} editingUser={state.editingUser} />
      </Modal>
    </div>
  );
};
