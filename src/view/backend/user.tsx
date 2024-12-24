import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  userList,
  userCreate,
  userInfoType,
  userCreateType,
  userDelete,
} from "@/api/user";
import { PlusOutlined } from "@ant-design/icons";
import { paramsType } from "@/api";
interface PaginationState extends paramsType {
  total: number;
}

export const AdminUser = () => {
  const [users, setUsers] = useState<userInfoType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
  });
  const [editingUser, setEditingUser] = useState<userInfoType | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const columns: ColumnsType<userInfoType> = [
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
          <Button type="link" onClick={() => showModal(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const fetchUsers = async (
    page = pagination.page,
    pageSize = pagination.page_size
  ) => {
    try {
      setLoading(true);
      const response = await userList({
        page,
        page_size: pageSize,
      });
      if (response.code === 0) {
        setUsers(response.data.list);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      message.error("获取用户列表失败");
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: userCreateType) => {
    try {
      setSubmitLoading(true);
      const response = await userCreate(values);
      if (response.code === 0) {
        message.success("创建用户成功");
        setIsModalVisible(false);
        form.resetFields();
        fetchUsers(pagination.page, pagination.page_size);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("创建用户失败");
      console.error("创建用户失败:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
    fetchUsers(page, pageSize);
  };

  useEffect(() => {
    fetchUsers(pagination.page, pagination.page_size);
  }, []);

  const showModal = (record?: userInfoType) => {
    setIsModalVisible(true);
    form.resetFields();

    if (record) {
      setEditingUser(record);
      form.setFieldsValue({
        nick_name: record.nick_name,
        account: record.account,
        email: record.email,
        address: record.address,
        role: record.role,
      });
    } else {
      setEditingUser(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个用户吗？删除后不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await userDelete(id);
          if (response.code === 0) {
            message.success("删除成功");
            fetchUsers(pagination.page, pagination.page_size);
          } else {
            message.error(response.message);
          }
        } catch (error) {
          message.error("删除失败");
          console.error("删除失败:", error);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Button
          type="primary"
          onClick={() => showModal()}
          size="large"
          icon={<PlusOutlined />}
        >
          新建用户
        </Button>
      </div>

      <div style={{ padding: "24px" }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
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
        />
      </div>

      <Modal
        title={editingUser ? "编辑用户" : "新建用户"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={() => form.submit()}
          >
            提交
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            name="nick_name"
            label="昵称"
            rules={[
              { required: true, message: "请输入昵称" },
              { max: 50, message: "昵称最多50个字符" },
            ]}
          >
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
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请输入角色" }]}
          >
            <Input placeholder="请输入角色" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
