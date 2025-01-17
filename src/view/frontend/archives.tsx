import { articleList, articleType } from "@/api/article";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { Empty, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// 归档数据结构
interface ArchiveGroup {
  year: string;
  months: {
    month: string;
    articles: articleType[];
  }[];
}

// 文章项组件
const ArticleItem = ({ article }: { article: articleType }) => (
  <Link
    to={`/article/${article.id}`}
    className="group block hover:bg-gray-50 p-3 rounded-lg transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-gray-800 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(article.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center text-gray-400 text-sm">
        <EyeOutlined className="mr-1" />
        <span>{article.look_count}</span>
      </div>
    </div>
  </Link>
);

// 月份组件
const MonthGroup = ({
  year,
  month,
  articles,
}: {
  year: string;
  month: string;
  articles: articleType[];
}) => (
  <div className="border-l-2 border-blue-500 pl-4">
    <h3 className="text-xl font-medium text-gray-600 mb-4">{month}月</h3>
    <div className="space-y-3">
      {articles.map((article) => (
        <ArticleItem key={article.id} article={article} />
      ))}
    </div>
  </div>
);

export const WebArchives = () => {
  const [archives, setArchives] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articleList({
          sort_field: "created_at",
          sort_order: "desc",
          page_size: 999,
        });

        // 按年月组织文章
        const groupedArticles = response.data.list.reduce(
          (groups: ArchiveGroup[], article) => {
            const date = new Date(article.created_at);
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");

            const yearGroup = groups.find((g) => g.year === year) || {
              year,
              months: [],
            };

            if (!groups.includes(yearGroup)) {
              groups.push(yearGroup);
            }

            const monthGroup = yearGroup.months.find(
              (m) => m.month === month
            ) || {
              month,
              articles: [],
            };

            if (!yearGroup.months.includes(monthGroup)) {
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

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center min-h-[calc(100vh-100px)]"
      />
    );
  }

  if (archives.length === 0) {
    return (
      <Empty
        description="暂无文章"
        className="flex justify-center items-center min-h-[calc(100vh-100px)]"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        文章归档
      </h1>
      <div className="space-y-8">
        {archives.map((yearGroup) => (
          <div
            key={yearGroup.year}
            className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
              <CalendarOutlined className="mr-2" />
              {yearGroup.year}年
            </h2>
            <div className="space-y-6">
              {yearGroup.months.map((monthGroup) => (
                <MonthGroup
                  key={`${yearGroup.year}-${monthGroup.month}`}
                  year={yearGroup.year}
                  month={monthGroup.month}
                  articles={monthGroup.articles}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
