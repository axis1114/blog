import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton, Empty, BackTop } from 'antd';
import { message } from 'antd';
import { articleDetail, articleType } from '@/api/article';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { Row, Col } from 'antd';
import { commentType, commentList } from '@/api/comment';
import { CommentArea } from '../comment/comment';
import { ArticleSearch } from '../search/articlesearch';
// 修改样式
const styles = `
/* 整体内容样式优化 */
.markdown-content {
    padding-bottom: 100px;
    font-size: 18px;  // 增大基础字号
    line-height: 2;   // 增加行高
    color: #2c3e50;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    letter-spacing: 0.3px;  // 增加字间距提高可读性
}

/* 标题样式优化 */
.markdown-content h1 {
    font-size: 38px;  // 更大的标题
    font-weight: 700;
    margin: 48px 0 28px;
    padding-bottom: 16px;
    border-bottom: 2px solid #4f46e5;  // 更醒目的边框颜色
    color: #1e293b;
    background: linear-gradient(to right, #4f46e5, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.markdown-content h2 {
    font-size: 32px;
    font-weight: 600;
    margin: 40px 0 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #6366f1;
    color: #2563eb;
}

.markdown-content h3 {
    font-size: 28px;
    font-weight: 600;
    margin: 32px 0 20px;
    color: #3b82f6;
}

.markdown-content h4 {
    font-size: 24px;
    font-weight: 600;
    margin: 28px 0 16px;
    color: #60a5fa;
}

/* 段落和列表样式优化 */
.markdown-content p {
    margin: 20px 0;
    line-height: 2;
    font-size: 18px;
}

.markdown-content ul, 
.markdown-content ol {
    padding-left: 28px;
    margin: 20px 0;
    font-size: 18px;
}

.markdown-content li {
    margin: 12px 0;
    line-height: 1.8;
}

/* 代码块样式优化 */
.markdown-content pre {
    background: #1e1e1e;  /* 更深的背景色 */
    border-radius: 8px;
    padding: 20px;
    overflow: auto;
    margin: 20px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    border: 1px solid #333;
}

.markdown-content code {
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    font-size: 15px;
    padding: 3px 6px;
    background-color: #f3f4f6;
    border-radius: 4px;
    margin: 0 2px;
    color: #d63384;  /* 更鲜明的颜色 */
    border: 1px solid #e5e7eb;
}

.markdown-content pre code {
    padding: 0;
    margin: 0;
    background-color: transparent;
    color: #e5e7eb;  /* 更亮的文本颜色 */
    font-size: 15px;
    border: none;
    line-height: 1.6;
}

/* 代码高亮颜色优化 */
.hljs-keyword {
    color: #569cd6;  /* 关键字蓝色 */
    font-weight: bold;
}

.hljs-string {
    color: #ce9178;  /* 字符串橙色 */
}

.hljs-comment {
    color: #6a9955;  /* 注释绿色 */
}

.hljs-function {
    color: #dcdcaa;  /* 函数黄色 */
}

.hljs-number {
    color: #b5cea8;  /* 数字浅绿色 */
}

.hljs-operator {
    color: #d4d4d4;  /* 运算符白色 */
}

.hljs-class {
    color: #4ec9b0;  /* 类名青色 */
}

.hljs-variable {
    color: #9cdcfe;  /* 变量浅蓝色 */
}

.hljs-property {
    color: #9cdcfe;  /* 属性浅蓝色 */
}

.hljs-punctuation {
    color: #d4d4d4;  /* 标点符号白色 */
}

/* 引用块样式优化 */
.markdown-content blockquote {
    margin: 28px 0;
    padding: 16px 28px;
    color: #4b5563;
    border-left: 4px solid #8b5cf6;  // 使用紫色作为强调色
    background: linear-gradient(to right, #f3f4f6, #ffffff);
    border-radius: 0 8px 8px 0;
    font-size: 18px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 表格样式优化 */
.markdown-content table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 28px 0;
    font-size: 16px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.markdown-content table th,
.markdown-content table td {
    padding: 16px;
    border: 1px solid #e2e8f0;
}

.markdown-content table th {
    background: linear-gradient(145deg, #3b82f6, #2563eb);
    color: white;
    font-weight: 600;
    font-size: 17px;
}

.markdown-content table tr:nth-child(even) {
    background-color: #f8fafc;
}

.markdown-content table tr:hover {
    background-color: #f1f5f9;
}

/* 链接样式优化 */
.markdown-content a {
    color: #6366f1;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
    font-weight: 500;
}

.markdown-content a:hover {
    border-bottom-color: #6366f1;
    color: #4f46e5;
    background-color: rgba(99, 102, 241, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
}

/* 图片样式优化 */
.markdown-content img {
    max-width: 100%;
    border-radius: 12px;
    margin: 24px 0;
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease;
}

.markdown-content img:hover {
    transform: scale(1.02);
}

/* 水平线样式优化 */
.markdown-content hr {
    margin: 32px 0;
    border: none;
    height: 2px;
    background: linear-gradient(to right, #4f46e5, #6366f1, #8b5cf6);
    border-radius: 2px;
}

/* 列表项标记样式 */
.markdown-content ul li::marker {
    color: #6366f1;
}

.markdown-content ol li::marker {
    color: #6366f1;
    font-weight: 600;
}
`;

// 配置 markdown 解析器
const mdParser = new MarkdownIt({
    html: true,                // 允许 HTML 标签
    linkify: true,            // 自动转换 URL 为链接
    typographer: true,        // 启用排版功能
    highlight: function (str, lang) {  // 代码高亮处理
        try {
            return hljs.highlight(str, { language: lang }).value;
        } catch (__) {
            return '';
        }
    }
});

// 从 markdown 内容中提取标题并生成目录
const extractHeadings = (content: string) => {
    const lines = content.split('\n');
    const headings = lines
        .filter(line => line.startsWith('#'))
        .map(line => {
            const level = line.match(/^#+/)?.[0].length || 0;  // 获取标题级别
            const title = line.replace(/^#+\s*/, '').trim();   // 提取标题文本
            // 生成唯一的锚点 ID
            const key = `heading-${title
                .toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                .replace(/^-|-$/g, '')}`;
            return { key, href: `#${key}`, title, level };
        });
    return headings;
};

// Markdown 内容展示组件
const MarkdownViewer = ({ content }: { content: string }) => {
    // 修改 markdown-it 的渲染规则，为标题添加 id
    mdParser.renderer.rules.heading_open = (tokens, idx) => {
        const title = tokens[idx + 1].content.trim();
        const id = `heading-${title
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
            .replace(/^-|-$/g, '')}`;
        return `<h${tokens[idx].markup.length} id="${id}">`;
    };

    return (
        <MdEditor
            value={content}
            view={{ menu: false, md: false, html: true }}
            canView={{ menu: false, md: false, html: true, fullScreen: false, hideMenu: false, both: false }}
            readOnly={true}
            className="border-none shadow-none pl-8"
            style={{ backgroundColor: 'transparent' }}
            renderHTML={(text) => (
                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: mdParser.render(text) }} />
            )}
        />
    );
};

// 文章目录组件
const TableOfContents = ({ content }: { content: string }) => {
    const headings = extractHeadings(content);

    // 处理目录项点击，实现平滑滚动
    const handleClick = (heading: { href: string }) => (e: React.MouseEvent) => {
        e.preventDefault();
        const targetId = heading.href.substring(1);
        const element = document.getElementById(targetId);

        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className='p-8 w-[350px]'>
            <div className='border border-gray-200'>
                <h3 className="px-4 py-3 text-lg font-medium">
                    文章目录
                </h3>
                <nav className="px-4 py-3 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {headings.map((heading) => (
                        <a
                            key={heading.key}
                            href={heading.href}
                            onClick={handleClick(heading)}
                            className={`
                            block py-2 text-gray-600 hover:text-blue-500 hover:bg-gray-50 
                            transition-colors
                            ${heading.level === 1 ? 'text-base font-medium' : ''}
                            ${heading.level === 2 ? 'pl-4 text-[15px]' : ''}
                            ${heading.level === 3 ? 'pl-8 text-[14px] text-gray-500' : ''}
                            ${heading.level === 4 ? 'pl-12 text-[13px] text-gray-500' : ''}
                            ${heading.level === 5 ? 'pl-16 text-[13px] text-gray-500' : ''}
                            ${heading.level === 6 ? 'pl-20 text-[13px] text-gray-500' : ''}
                        `}
                        >
                            <span className="flex items-center">
                                <span className={`
                                inline-block w-1.5 h-1.5 mr-2
                                ${heading.level === 1 ? 'bg-blue-500' : ''}
                                ${heading.level === 2 ? 'bg-blue-400' : ''}
                                ${heading.level === 3 ? 'bg-gray-400' : ''}
                                ${heading.level >= 4 ? 'bg-gray-300' : ''}
                            `}></span>
                                {heading.title}
                            </span>
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
};

// 文章头部信息组件
const ArticleHeader = ({ article }: { article: articleType }) => {
    return (
        <div className="border-b border-gray-200 pl-12 pr-5 border-r border-gray-200">
            {/* 文章标题 */}
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {article.title}
            </h1>

            {/* 文章信息 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">

                    {/* 分类标签 */}
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xl">
                        {article.category}
                    </div>

                    {/* 发布时间 */}
                    <div className="text-xl text-gray-500">
                        发布于{new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xl text-gray-500">
                        更新于{new Date(article.updated_at).toLocaleDateString()}
                    </div>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center space-x-4 text-gray-500 text-xl">
                    <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{article.look_count} 阅读</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{article.comment_count} 评论</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 返回顶部组件
const BackToTop = () => {
    return (
        <BackTop visibilityHeight={100}>
            <div className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 
                          text-white w-10 h-10 rounded-full flex items-center 
                          justify-center cursor-pointer shadow-lg 
                          transition-all duration-300 ease-in-out">
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
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

    // 获取文章详情
    const fetchArticleDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await articleDetail(id as string);
            if (res.code === 2000) {
                setArticle(res.data);
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            message.error('获取文章详情失败');
            console.error('获取文章详情失败:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 获取评论列表
    const fetchComments = useCallback(async () => {
        if (!id) return;
        try {
            const res = await commentList({ article_id: id });
            if (res.code === 2000) {
                setComments(res.data);
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            message.error('获取评论列表失败');
            console.error('获取评论列表失败:', error);
        }
    }, [id]);

    // 初始化数据
    useEffect(() => {
        fetchArticleDetail();
        fetchComments();
    }, [id, fetchComments]);

    // 添加 Markdown 样式
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <Skeleton
                    active
                    avatar
                    paragraph={{ rows: 10 }}
                    className="max-w-4xl mx-auto"
                />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Empty
                    description="文章不存在"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    return (
        <Row gutter={24}>
            <Col span={18} style={{ padding: '0px 0px 0px 12px' }}>
                <ArticleHeader article={article} />
                <MarkdownViewer content={article.content} />
                <CommentArea
                    comments={comments}
                    onCommentSuccess={fetchComments}
                />
                <BackToTop />
            </Col>

            <Col span={6} className="sticky top-4" style={{ height: 'fit-content' }}>
                <ArticleSearch />
                {article && <TableOfContents content={article.content} className='p-8' />}
            </Col>
        </Row>
    );
};
