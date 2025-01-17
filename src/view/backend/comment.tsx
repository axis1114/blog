import { paramsType } from "@/api";
import { SearchOutlined } from "@ant-design/icons";
import { Col, Input, List, message, Pagination, Row } from "antd";
import { useCallback, useEffect, useState } from "react";
import { articleList, articleType } from "../../api/article";
import { commentList, commentType } from "../../api/comment";
import { CommentArea } from "../../components/comment/comment";

interface PaginationState extends paramsType {
  total: number;
}

const useArticlePagination = (fetchData: Function) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
  });

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize || prev.page_size,
    }));
    fetchData(page, pageSize || pagination.page_size);
  };

  return { pagination, setPagination, handlePageChange };
};

const ArticleList = ({
  articles,
  onArticleClick,
  onSearch,
  pagination,
  onPageChange,
}: {
  articles: articleType[];
  onArticleClick: (id: string) => void;
  onSearch: (value: string) => void;
  pagination: PaginationState;
  onPageChange: (page: number, pageSize?: number) => void;
}) => (
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
            onSearch={onSearch}
            className="square-search-input pt-4"
          />
        </>
      }
      dataSource={articles}
      renderItem={(article) => (
        <List.Item
          onClick={() => onArticleClick(article.id)}
          className="px-4 py-2 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 truncate">
          {article.title}
        </List.Item>
      )}
    />
    <div className="px-4 py-2 flex justify-center">
      <Pagination
        current={pagination.page}
        pageSize={pagination.page_size}
        total={pagination.total}
        onChange={onPageChange}
        simple
      />
    </div>
  </div>
);

export const AdminComment = () => {
  const [state, setState] = useState({
    selectedArticleId: "",
    articles: [] as articleType[],
    comments: [] as commentType[],
    loading: false,
  });

  const fetchArticles = useCallback(async (page = 1, page_size = 10) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const res = await articleList({ page, page_size });

      if (res.code === 0) {
        setState((prev) => ({ ...prev, articles: res.data.list }));
        setPagination((prev) => ({ ...prev, total: res.data.total }));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("获取文章列表失败");
      console.error("获取文章列表失败:", error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const { pagination, setPagination, handlePageChange } =
    useArticlePagination(fetchArticles);

  const handleArticleClick = useCallback(async (articleId: string) => {
    setState((prev) => ({ ...prev, selectedArticleId: articleId }));
    try {
      const res = await commentList({ article_id: articleId });
      if (res.code === 0) {
        setState((prev) => ({ ...prev, comments: res.data }));
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
          setState((prev) => ({ ...prev, articles: res.data.list }));
          setPagination((prev) => ({ ...prev, total: res.data.total }));
        } else {
          message.error(res.message);
        }
      } catch (error) {
        message.error("搜索文章失败");
        console.error("搜索文章失败:", error);
      }
    },
    [pagination.page_size]
  );

  const fetchComments = useCallback(async () => {
    if (!state.selectedArticleId) return;
    try {
      const res = await commentList({ article_id: state.selectedArticleId });
      if (res.code === 0) {
        setState((prev) => ({ ...prev, comments: res.data }));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error("获取评论列表失败");
      console.error("获取评论列表失败:", error);
    }
  }, [state.selectedArticleId]);

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <Row gutter={16} className="h-[calc(100vh-64px)]">
      <Col span={6} style={{ borderRight: "2px solid #e8e8e8" }}>
        <ArticleList
          articles={state.articles}
          onArticleClick={handleArticleClick}
          onSearch={handleSearch}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Col>
      <Col span={18} className="h-full overflow-hidden">
        {state.selectedArticleId && (
          <CommentArea
            comments={state.comments}
            onCommentSuccess={fetchComments}
            className="h-full overflow-y-auto"
            articleId={state.selectedArticleId}
          />
        )}
      </Col>
    </Row>
  );
};
