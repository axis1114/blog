import { Col, message, Row } from "antd";
import { useEffect, useMemo, useState } from "react";
import { articleList, articleParamsType, articleType } from "../../api/article";
import { ArticleList } from "../../components/articlelist/articlelist";
import { FriendLinkList } from "../../components/friendlink/friendlink";
import { ArticleFilter } from "../../components/search/articlefilter";

interface PaginationState extends articleParamsType {
  total: number;
}

export const WebHome = () => {
  const [articles, setArticles] = useState<articleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total: 0,
    category: undefined,
    sort_field: undefined,
    sort_order: undefined,
    key: undefined,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchArticles = async (
    page = pagination.page,
    pageSize = pagination.page_size,
    category?: string
  ) => {
    setLoading(true);
    try {
      const params = {
        ...pagination,
        page,
        page_size: pageSize,
        category: category === "All" ? undefined : category,
      };
      const res = await articleList(params);
      if (res.code === 0) {
        setArticles(res.data.list);
        setPagination((prev) => ({ ...prev, total: res.data.total, category }));
      }
    } catch (error) {
      console.error("获取文章列表失败:", error);
      message.error("获取文章列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    page: number,
    pageSize: number = pagination.page_size || 10
  ) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: pageSize,
    }));
    fetchArticles(page, pageSize);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const sidebar = useMemo(
    () => (
      <div className="space-y-8">
        <div className="bg-white shadow-sm border border-gray-100/80">
          <ArticleFilter
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onSearch={(params) => {
              setPagination((prev) => ({
                ...prev,
                ...params,
                page: 1,
              }));
              fetchArticles(1, pagination.page_size, params.category);
            }}
          />
        </div>
        <div className="bg-white shadow-sm border border-gray-100/80">
          <FriendLinkList />
        </div>
      </div>
    ),
    [selectedCategory, pagination.page_size]
  );

  return (
    <div className="flex justify-center w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1500px] w-full px-4">
        <Row gutter={24}>
          <Col span={19}>
            <ArticleList
              articles={articles}
              loading={loading}
              pagination={{
                current: pagination.page || 1,
                pageSize: pagination.page_size || 10,
                total: pagination.total,
                onChange: handlePageChange,
              }}
            />
          </Col>
          <Col span={5}>{sidebar}</Col>
        </Row>
      </div>
    </div>
  );
};
