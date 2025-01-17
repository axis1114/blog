import { paramsType } from "@/api";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Image,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RcFile } from "antd/es/upload/interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  imageDelete,
  imageList,
  imageType,
  imageUpload,
} from "../../api/image";

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

const ImagePreview = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={96}
    height={54}
    style={{ objectFit: "cover" }}
    placeholder={
      <div className="w-24 h-[54px] flex justify-center items-center bg-gray-100">
        <LoadingOutlined />
      </div>
    }
    preview={{
      maskClassName: "customize-mask",
      mask: <div>预览</div>,
    }}
  />
);

const getImageColumns = (
  handleDelete: (id: number) => void
): ColumnsType<imageType> => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "预览",
    key: "preview",
    render: (_, record) => <ImagePreview src={record.path} alt={record.name} />,
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
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      </Space>
    ),
  },
];

const ImageUploader = ({
  onUpload,
}: {
  onUpload: (file: RcFile) => Promise<boolean>;
}) => {
  const uploadProps = {
    beforeUpload: onUpload,
    showUploadList: false,
    accept: "image/*",
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: true,
  };

  return (
    <Upload.Dragger {...uploadProps}>
      <p className="ant-upload-drag-icon">
        <UploadOutlined style={{ fontSize: 48, color: "#40a9ff" }} />
      </p>
      <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
      <p className="ant-upload-hint">
        支持同时上传多张图片，单个文件大小不超过20MB
      </p>
    </Upload.Dragger>
  );
};

export const AdminImage = () => {
  const [state, setState] = useState({
    loading: false,
    data: [] as imageType[],
  });

  const { pagination, setPagination, handlePageChange } = usePagination();

  const fetchData = useCallback(
    async (page = pagination.page, page_size = pagination.page_size) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const res = await imageList({ page, page_size });

        if (res.code === 0) {
          setState((prev) => ({ ...prev, data: res.data.list }));
          setPagination((prev) => ({ ...prev, total: res.data.total }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        console.error("获取图片列表失败:", error);
        message.error("获取图片列表失败");
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
        content: "确定要删除这张图片吗？删除后不可恢复。",
        onOk: async () => {
          try {
            const res = await imageDelete(id);
            if (res.code === 0) {
              message.success("删除成功");
              fetchData(pagination.page, pagination.page_size);
            } else {
              message.error(res.message);
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

  const handleUpload = useCallback(
    async (file: RcFile) => {
      try {
        const files = file instanceof FileList ? Array.from(file) : [file];
        const res = await imageUpload(files);
        if (res.code === 0) {
          message.success("上传成功");
          fetchData(pagination.page, pagination.page_size);
        } else {
          message.error(res.message);
        }
      } catch (error) {
        console.error("上传失败:", error);
        message.error("上传失败");
      }
      return false;
    },
    [pagination]
  );

  const columns = useMemo(() => getImageColumns(handleDelete), [handleDelete]);

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
    <div className="admin_image">
      <div className="mb-6">
        <ImageUploader onUpload={handleUpload} />
      </div>

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
  );
};
