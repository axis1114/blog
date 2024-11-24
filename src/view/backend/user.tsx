import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { userList, userCreate, userInfoType, userCreateType, userDelete } from '@/api/user';
import { PlusOutlined } from '@ant-design/icons';

export const AdminUser = () => {
    // 状态管理
    const [users, setUsers] = useState<userInfoType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [editingUser, setEditingUser] = useState<userInfoType | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    // 表格列定义
    const columns: ColumnsType<userInfoType> = [
        {
            title: '用户ID',
            dataIndex: 'id',
            key: 'id',
            width: "8%",
        },
        {
            title: '昵称',
            dataIndex: 'nick_name',
            key: 'nick_name',
        },
        {
            title: '账号',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => showModal(record)}>
                        编辑
                    </Button>
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

    // 获取用户列表
    const fetchUsers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await userList({
                page,
                page_size: pageSize,
            });
            if (response.code === 2000) {
                setUsers(response.data.list);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize,
                    total: response.data.total,
                });
            }
        } catch (error) {
            message.error('获取用户列表失败');
        }
        setLoading(false);
    };

    // 创建用户
    const handleCreateUser = async (values: userCreateType) => {
        setSubmitLoading(true);
        try {
            const response = await userCreate(values);
            if (response.code === 2000) {
                message.success('创建用户成功');
                setIsModalVisible(false);
                form.resetFields();
                fetchUsers(pagination.current, pagination.pageSize);
            } else {
                message.error(response.msg || '创建用户失败');
            }
        } catch (error) {
            message.error('创建用户失败');
        } finally {
            setSubmitLoading(false);
        }
    };

    // 表格分页变化
    const handleTableChange = (newPagination: any) => {
        fetchUsers(newPagination.current, newPagination.pageSize);
    };

    // 初始加载
    useEffect(() => {
        fetchUsers();
    }, []);

    // 打开弹框
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

    // 关闭弹框
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingUser(null);
    };

    // 删除用户
    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个用户吗？删除后不可恢复。',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const response = await userDelete(id);
                    if (response.code === 2000) {
                        message.success("删除成功");
                        fetchUsers(pagination.current, pagination.pageSize);
                    } else {
                        message.error(response.msg || "删除失败");
                    }
                } catch (error) {
                    message.error("删除失败");
                }
            }
        });
    };

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

            {/* 表格区域 */}
            <div style={{ padding: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </div>

            {/* 模态框 */}
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
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateUser}
                >
                    <Form.Item
                        name="nick_name"
                        label="昵称"
                        rules={[
                            { required: true, message: '请输入昵称' },
                            { max: 50, message: '昵称最多50个字符' }
                        ]}
                    >
                        <Input placeholder="请输入昵称" />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[
                                { required: true, message: '请输入密码' },
                                { min: 6, message: '密码至少6个字符' },
                                { max: 20, message: '密码最多20个字符' }
                            ]}
                        >
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Input placeholder="请输入角色" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};