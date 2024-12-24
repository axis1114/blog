import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  categoryType,
  categoryList,
  categoryDelete,
  categoryCreate,
} from "@/api/category";
import { ColumnsType } from "antd/es/table";
import { paramsType } from "@/api";

// 分页状态接口定义
interface PaginationState extends paramsType {
  total: number;
}

export const AdminCategory = () => {
  // 状态管理
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<categoryType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
  });

  // 获取分类列表数据
  const fetchData = async (
    page = pagination.page,
    page_size = pagination.page_size
  ) => {
    try {
      setLoading(true);
      const res = await categoryList({
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
      console.error("获取分类列表失败:", error);
      message.error("获取分类列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 删除分类的处理函数
  const handleDelete = async (id: number) => {
    if (!id) {
      message.error("无效的分类ID");
      return;
    }

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
            fetchData();
          } else {
            message.error(response.message);
          }
        } catch (error) {
          console.error("删除分类错误:", error);
          message.error("删除失败");
        }
      },
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
    fetchData(page, pageSize);
  };

  // 模态框相关操作
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 提交表单处理
  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await form.validateFields();
      if (!values.name || values.name.trim() === "") {
        message.error("分类名称不能为空");
        return;
      }

      setSubmitLoading(true);
      const response = await categoryCreate(values);

      if (response.code === 0) {
        message.success("创建成功");
        handleCancel();
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("创建分类错误:", error);
      message.error("创建失败，请稍后重试");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<categoryType> = [
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

  // 初始化加载数据
  useEffect(() => {
    fetchData(pagination.page, pagination.page_size);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%" }}>
      {/* 页面头部 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Button
          type="primary"
          onClick={showModal}
          size="large"
          icon={<PlusOutlined />}
        >
          新建分类
        </Button>
      </div>

      {/* 分类列表表格 */}
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

      {/* 新建分类模态框 */}
      <Modal
        title="新建分类"
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
            label="分类名称"
            name="name"
            rules={[{ max: 50, message: "分类名称最多50个字符" }]}
          >
            <Input placeholder="请输入分类名称" maxLength={50} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
