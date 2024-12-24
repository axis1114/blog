import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  friendlinkType,
  friendlinkList,
  friendlinkDelete,
  friendlinkCreate,
} from "@/api/friendlink";
import { ColumnsType } from "antd/es/table";
import { paramsType } from "@/api";
interface PaginationState extends paramsType {
  total: number;
}
export const AdminFriendlink = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<friendlinkType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
  });
  // 获取友链列表
  const fetchData = async (
    page = pagination.page,
    page_size = pagination.page_size
  ) => {
    try {
      setLoading(true);
      const res = await friendlinkList({
        page,
        page_size,
      });
      if (res.code === 0) {
        setData(res.data.list);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total,
        }));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("获取友情链接列表失败");
      console.error("获取友情链接列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 删除友链
  const handleDelete = async (id: number) => {
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
            fetchData();
          } else {
            message.error(response.message);
          }
        } catch (error: any) {
          message.error("删除失败，请稍后重试");
          console.error("删除失败:", error);
        }
      },
    });
  };

  // 打开弹框
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  // 关闭弹框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      const res = await friendlinkCreate(values);
      if (res.code === 0) {
        message.success("创建成功");
        handleCancel();
        fetchData();
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("创建失败");
      console.error("创建失败:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<friendlinkType> = [
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

  useEffect(() => {
    fetchData(pagination.page, pagination.page_size);
  }, []);

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
    fetchData(page, pageSize);
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
        <h2 style={{ margin: 0 }}>友情链接管理</h2>
        <Button
          type="primary"
          onClick={showModal}
          size="large"
          icon={<PlusOutlined />}
        >
          新建友链
        </Button>
      </div>

      {/* 表格区域 */}
      <div style={{ padding: "24px" }}>
        <Table
          columns={columns}
          dataSource={data}
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
          loading={loading}
        />
      </div>

      {/* 模态框 */}
      <Modal
        title="新建友情链接"
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
            onClick={handleSubmit}
          >
            提交
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            name="name"
            rules={[{ max: 50, message: "名称最多50个字符" }]}
          >
            <Input placeholder="请输入友链名称" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            label="链接"
            name="link"
            rules={[{ type: "url", message: "请输入有效的URL地址" }]}
          >
            <Input placeholder="请输入友链地址，例如：https://example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
