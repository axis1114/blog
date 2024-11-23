import { Button, Image, Modal, Space, Table, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { imageDelete, imageList, imageType, imageUpload } from "../../api/image";
import type { ColumnsType } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload/interface";
import { paramsType } from "@/api";

interface PaginationState extends paramsType {
    total: number;
}

export const AdminImage = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<imageType[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        page_size: 10,
        total: 0,
    });

    // 获取图片列表
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await imageList({
                page,
                page_size: pagination.page_size,
            });
            console.log(res);
            if (res.code === 2000) {
                setData(res.data.list);
                setPagination({
                    ...pagination,
                    page,
                    total: res.data.total,
                });
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            message.error("获取图片列表失败");
        }
        setLoading(false);
    };

    // 删除图片
    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: "确认删除",
            content: "确定要删除这张图片吗？删除后不可恢复。",
            onOk: async () => {
                try {
                    await imageDelete(id);
                    message.success("删除成功");
                    fetchData(pagination.page);
                } catch (error) {
                    message.error("删除失败");
                }
            },
        });
    };

    // 上传图片
    const handleUpload = async (file: RcFile) => {
        try {
            await imageUpload([file]);
            message.success("上传成功");
            fetchData(pagination.page);
        } catch (error) {
            message.error("上传失败");
        }
        return false; // 阻止 Upload 组件默认上传行为
    };

    const columns: ColumnsType<imageType> = [
        {
            title: "预览",
            key: "preview",
            render: (_, record) => (
                <Image
                    src={record.path}
                    alt={record.name}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                />
            ),
        },
        {
            title: "文件名",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "类型",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "大小",
            dataIndex: "size",
            key: "size",
            render: (size) => `${(size / 1024).toFixed(2)} KB`,
        },
        {
            title: "上传时间",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
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
        <div className="admin_image">
            <div style={{ marginBottom: 16 }}>
                <Upload
                    beforeUpload={handleUpload}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />} type="primary">
                        上传图片
                    </Button>
                </Upload>
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
