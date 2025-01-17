import { articleDetail, articleType } from "@/api/article";
import { commentList, commentType } from "@/api/comment";
import { formatDate } from "@/utils/date";
import { CommentOutlined, EyeOutlined } from "@ant-design/icons";
import { BackTop, Badge, Col, Empty, message, Row, Spin } from "antd";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { useCallback, useEffect, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { useParams } from "react-router-dom";
import { CommentArea } from "../comment/comment";
import { ArticleSearch } from "../search/articlesearch";

interface HeadingType {
  key: string;
  href: string;
  title: string;
  level: number;
}

// 1. 抽取 Markdown 样式配置
const markdownStyles = `
  /* 基础样式 */
  .markdown-content {
    color: #374151;
    line-height: 1.8;
    font-size: 16px;
  }

  /* 标题样式 */
  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    margin: 2em 0 1em;
    font-weight: 600;
    line-height: 1.25;
  }

  /* 段落和列表样式 */
  .markdown-content p {
    margin: 1.25em 0;
    line-height: 2;
  }

  .markdown-content ul,
  .markdown-content ol {
    padding-left: 1.75em;
    margin: 1.25em 0;
  }

  .markdown-content li {
    margin: 0.75em 0;
    line-height: 1.8;
  }

  /* 代码块样式 */
  .markdown-content pre {
    background: #1e1e1e;
    border-radius: 0.5em;
    padding: 1.25em;
    overflow: auto;
    margin: 1.25em 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    border: 1px solid #333;
  }

  .markdown-content code {
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    font-size: 0.9375em;
    padding: 0.1875em 0.375em;
    background-color: #f3f4f6;
    border-radius: 0.25em;
    margin: 0 0.125em;
    color: #d63384;
    border: 1px solid #e5e7eb;
  }

  /* 其他样式... */
`;

// 2. 抽取 Markdown 解析器配置
const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    try {
      return hljs.highlight(str, { language: lang }).value;
    } catch (__) {
      return "";
    }
  },
}).use(anchor, {
  permalink: anchor.permalink.ariaHidden({
    placement: "before",
  }),
});

// 3. 抽取文章头部组件
const ArticleHeader = ({ article }: { article: articleType }) => (
  <div className="border-2 border-gray-200 p-8 bg-white rounded-t-lg">
    <h1 className="text-3xl font-bold mb-6 text-gray-900">{article.title}</h1>
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4">
        <Badge
          className="px-4 py-1.5 bg-blue-50 text-blue-600 text-lg"
          count={article.category}
        />
        <div className="text-lg text-gray-500 px-4 py-1.5 bg-gray-50">
          发布于 {formatDate(article.created_at)}
        </div>
        <div className="text-lg text-gray-500 px-4 py-1.5 bg-gray-50">
          更新于 {formatDate(article.updated_at)}
        </div>
      </div>
      <div className="flex gap-4 text-gray-500 text-lg">
        <MetricBadge
          icon={<EyeOutlined />}
          count={article.look_count}
          text="阅读"
        />
        <MetricBadge
          icon={<CommentOutlined />}
          count={article.comment_count}
          text="评论"
        />
      </div>
    </div>
  </div>
);

// 4. 抽取指标徽章组件
const MetricBadge = ({
  icon,
  count,
  text,
}: {
  icon: React.ReactNode;
  count: number;
  text: string;
}) => (
  <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50">
    {icon}
    <span>
      {count} {text}
    </span>
  </div>
);

// 5. 抽取目录项组件
const TableOfContentsItem = ({
  heading,
  active,
}: {
  heading: HeadingType;
  active: boolean;
}) => (
  <a
    href={heading.href}
    className={`
      block py-2 px-4 transition-all duration-200
      ${heading.level === 1 ? "text-base font-medium" : ""}
      ${heading.level === 2 ? "pl-8 text-[15px]" : ""}
      ${heading.level === 3 ? "pl-12 text-[14px] text-gray-500" : ""}
      ${heading.level >= 4 ? "pl-16 text-[13px] text-gray-500" : ""}
      ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}
    `}>
    <span className="flex items-center gap-2">
      <span
        className={`
        inline-block w-1.5 h-1.5 rounded-full
        ${heading.level === 1 ? "bg-blue-500" : ""}
        ${heading.level === 2 ? "bg-blue-400" : ""}
        ${heading.level === 3 ? "bg-gray-400" : ""}
        ${heading.level >= 4 ? "bg-gray-300" : ""}
      `}
      />
      {heading.title}
    </span>
  </a>
);

// 从 markdown 内容中提取标题并生成目录结构
const extractHeadings = (content: string) => {
  const lines = content.split("\n");
  const headings = lines
    .filter((line) => line.startsWith("#"))
    .map((line) => {
      const level = line.match(/^#+/)?.[0].length || 0; // 获取标题级别
      const title = line.replace(/^#+\s*/, "").trim(); // 提取标题文本
      // 生成唯一的锚点 ID
      const key = `heading-${title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-|-$/g, "")}`;
      return { key, href: `#${key}`, title, level };
    });
  return headings;
};

// Markdown 内容展示组件 - 负责渲染文章内容
const MarkdownViewer = ({ content }: { content: string }) => {
  return (
    <>
      <style>{markdownStyles}</style>
      <MdEditor
        value={content}
        view={{ menu: false, md: false, html: true }}
        canView={{
          menu: false,
          md: false,
          html: true,
          fullScreen: false,
          hideMenu: false,
          both: false,
        }}
        readOnly={true}
        className="border-none shadow-none pl-8"
        style={{ backgroundColor: "transparent" }}
        renderHTML={(text) => (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: mdParser.render(text) }}
          />
        )}
      />
    </>
  );
};

// 返回顶部按钮组件
const BackToTop = () => {
  return (
    <BackTop visibilityHeight={100}>
      <div
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 
                          text-white w-10 h-10 rounded-full flex items-center 
                          justify-center cursor-pointer shadow-lg 
                          transition-all duration-300 ease-in-out">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </div>
    </BackTop>
  );
};

// 文章详情页主组件
export const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<articleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<commentType[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");

  // 6. 使用 useCallback 优化方法
  const fetchArticleDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await articleDetail(id);
      if (res.code === 0) {
        setArticle(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("获取文章详情失败:", error);
      message.error("获取文章详情失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;

    try {
      const res = await commentList({ article_id: id });
      if (res.code === 0) {
        setComments(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("获取评论列表失败:", error);
      message.error("获取评论列表失败");
    }
  }, [id]);

  // 7. 使用 useEffect 处理副作用
  useEffect(() => {
    fetchArticleDetail();
    fetchComments();
  }, [fetchArticleDetail, fetchComments]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document
      .querySelectorAll(
        ".markdown-content h1, .markdown-content h2, .markdown-content h3"
      )
      .forEach((heading) => {
        observer.observe(heading);
      });

    return () => observer.disconnect();
  }, [article]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Empty description="文章不存在" />
      </div>
    );
  }

  const headings = extractHeadings(article.content);

  return (
    <div className="flex justify-center w-full bg-gray-50 py-8">
      <div className="max-w-[1500px] w-full px-4">
        <Row gutter={24}>
          <Col span={18}>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <ArticleHeader article={article} />
              <div className="border-x-2 border-gray-200">
                <MarkdownViewer content={article.content} />
              </div>
              <div className="border-2 border-gray-200 rounded-b-lg">
                <CommentArea
                  comments={comments}
                  onCommentSuccess={fetchComments}
                  articleId={id}
                />
              </div>
            </div>
            <BackToTop />
          </Col>

          <Col
            span={6}
            className="sticky top-4"
            style={{ height: "fit-content" }}>
            <div className="border-2 border-gray-200 bg-white shadow-sm rounded-lg mb-4">
              <ArticleSearch />
            </div>
            {headings.length > 0 && (
              <div className="border-2 border-gray-200 bg-white shadow-sm rounded-lg">
                <h3 className="px-6 py-4 text-lg font-medium border-b-2 border-gray-200">
                  文章目录
                </h3>
                <nav className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {headings.map((heading) => (
                    <TableOfContentsItem
                      key={heading.key}
                      heading={heading}
                      active={activeHeading === heading.key}
                    />
                  ))}
                </nav>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};
