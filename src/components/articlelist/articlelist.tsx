import { EyeOutlined, MessageOutlined } from "@ant-design/icons";
import { Empty, List, Spin, Tag, Typography } from "antd";
import { memo } from "react";
import { articleType } from "../../api/article";

const { Title, Paragraph } = Typography;

interface ArticleListProps {
  articles: articleType[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
}

const ArticleItem = ({ item }: { item: articleType }) => (
  <List.Item className="px-8 py-6 hover:bg-gray-50/30 transition-colors">
    <div className="flex gap-8">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between">
          <a href={`/article/${item.id}`}>
            <Title level={5} className="!m-0 text-lg hover:text-gray-600">
              {item.title}
            </Title>
          </a>
          <Tag>{item.category}</Tag>
        </div>

        <Paragraph ellipsis={{ rows: 2 }} className="text-gray-500 text-sm">
          {item.abstract}
        </Paragraph>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">
            {new Date(item.created_at).toLocaleDateString()}
          </span>

          <div className="flex gap-4">
            <span className="text-gray-600">
              <EyeOutlined /> {item.look_count}
            </span>
            <span className="text-gray-600">
              <MessageOutlined /> {item.comment_count}
            </span>
          </div>
        </div>
      </div>

      {item.cover_url && (
        <img
          loading="lazy"
          src={item.cover_url}
          alt={item.title}
          className="w-48 h-32 object-cover hover:scale-105 transition-transform"
        />
      )}
    </div>
  </List.Item>
);

export const ArticleList = memo(
  ({ articles, loading, pagination }: ArticleListProps) => {
    if (loading) {
      return (
        <Spin
          size="large"
          className="flex justify-center min-h-[80vh] items-center"
        />
      );
    }

    if (articles.length === 0) {
      return (
        <Empty
          description="暂无文章"
          className="min-h-[80vh] flex justify-center items-center"
        />
      );
    }

    return (
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={articles}
        className="bg-white"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          position: "bottom",
          className: "flex justify-center",
        }}
        renderItem={(item) => <ArticleItem item={item} />}
      />
    );
  }
);
