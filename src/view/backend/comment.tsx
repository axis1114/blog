import { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, List, message, Pagination, Input } from "antd";
import { CommentArea } from "../../components/comment/comment";
import { articleList, articleType } from "../../api/article";
import { commentList, commentType } from "../../api/comment";
import { SearchOutlined } from "@ant-design/icons";
import { paramsType } from "@/api";

interface PaginationState extends paramsType {
  total: number;
}

export const AdminComment = () => {
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [articles, setArticles] = useState<articleType[]>([]);
  const [comments, setComments] = useState<commentType[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
  });

  useEffect(() => {
    fetchArticles(pagination.page, pagination.page_size);
  }, []);

  const fetchArticles = useCallback(
    async (page = pagination.page, page_size = pagination.page_size) => {
      try {
        const res = await articleList({
          page,
          page_size,
        });
        if (res.code === 0) {
          setArticles(res.data.list);
          setPagination((prev) => ({
            ...prev,
            total: res.data.total,
          }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        message.error("获取文章列表失败");
        console.error("获取文章列表失败:", error);
      }
    },
    [pagination]
  );

  const handleArticleClick = useCallback(async (articleId: string) => {
    setSelectedArticleId(articleId);
    try {
      const res = await commentList({ article_id: articleId });
      if (res.code === 0) {
        setComments(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("获取评论列表失败");
      console.error("获取评论列表失败:", error);
    }
  }, []);

  const handleSearch = useCallback(
    async (value: string) => {
      try {
        const res = await articleList({
          page: 1,
          page_size: pagination.page_size,
          key: value,
        });
        if (res.code === 0) {
          setArticles(res.data.list);
          setPagination((prev) => ({
            ...prev,
            total: res.data.total,
          }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        message.error("搜索文章失败");
        console.error("搜索文章失败:", error);
      }
    },
    [pagination]
  );

  const fetchComments = useCallback(async () => {
    if (!selectedArticleId) return;
    try {
      const res = await commentList({ article_id: selectedArticleId });
      if (res.code === 0) {
        setComments(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("获取评论列表失败");
      console.error("获取评论列表失败:", error);
    }
  }, [selectedArticleId]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
    fetchArticles(page, pageSize);
  };

  const articleListElement = useMemo(
    () => (
      <div className="px-5">
        <List
          header={
            <>
              <div className="text-lg">文章列表</div>
              <Input.Search
                placeholder="搜索文章..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="square-search-input pt-4"
              />
            </>
          }
          dataSource={articles || []}
          renderItem={(article) => (
            <List.Item
              onClick={() => handleArticleClick(article.id)}
              className="px-4 py-2 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 truncate"
            >
              {article.title}
            </List.Item>
          )}
        />
        <div className="px-4 py-2 flex justify-center">
          <Pagination
            current={pagination.page}
            pageSize={pagination.page_size}
            total={pagination.total}
            onChange={handlePageChange}
            simple
          />
        </div>
      </div>
    ),
    [articles, handleArticleClick, pagination, handleSearch]
  );

  return (
    <Row gutter={16} className="h-[calc(100vh-64px)]">
      <Col span={6} style={{ borderRight: "2px solid #e8e8e8" }}>
        {articleListElement}
      </Col>
      <Col span={18} className="h-full overflow-hidden">
        {selectedArticleId && (
          <CommentArea
            comments={comments}
            onCommentSuccess={fetchComments}
            className="h-full overflow-y-auto"
            articleId={selectedArticleId}
          />
        )}
      </Col>
    </Row>
  );
};
