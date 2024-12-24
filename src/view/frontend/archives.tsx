import { articleList, articleType } from "@/api/article";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { Empty, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// 归档数据结构类型定义
interface ArchiveGroup {
  year: string;
  months: {
    month: string;
    articles: articleType[];
  }[];
}

export const WebArchives = () => {
  const [archives, setArchives] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articleList({
        sort_field: "created_at",
        sort_order: "desc",
        page_size: 999,
      });

      // 按年份和月份组织文章
      const groupedArticles = response.data.list.reduce(
        (groups: ArchiveGroup[], article) => {
          const date = new Date(article.created_at);
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");

          let yearGroup = groups.find((g) => g.year === year);
          if (!yearGroup) {
            yearGroup = { year, months: [] };
            groups.push(yearGroup);
          }

          let monthGroup = yearGroup.months.find((m) => m.month === month);
          if (!monthGroup) {
            monthGroup = { month, articles: [] };
            yearGroup.months.push(monthGroup);
          }

          monthGroup.articles.push(article);
          return groups;
        },
        []
      );

      setArchives(groupedArticles);
    } catch (error) {
      console.error("获取文章列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Spin size="large" />
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Empty description="暂无文章" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        文章归档
      </h1>

      <div className="space-y-8">
        {archives.map((yearGroup) => (
          <div
            key={yearGroup.year}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
              <CalendarOutlined className="mr-2" />
              {yearGroup.year}年
            </h2>

            <div className="space-y-6">
              {yearGroup.months.map((monthGroup) => (
                <div
                  key={`${yearGroup.year}-${monthGroup.month}`}
                  className="border-l-2 border-blue-500 pl-4"
                >
                  <h3 className="text-xl font-medium text-gray-600 mb-4">
                    {monthGroup.month}月
                  </h3>

                  <div className="space-y-3">
                    {monthGroup.articles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.id}`}
                        className="group block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-gray-800 group-hover:text-blue-600 transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(
                                article.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <EyeOutlined className="mr-1" />
                            <span>{article.look_count}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
