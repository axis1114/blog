import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton, Empty } from 'antd';
import { message } from 'antd';
import { articleDetail, articleType } from '@/api/article';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { Row, Col } from 'antd';

// 配置 markdown 解析器
const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        try {
            return hljs.highlight(str, { language: lang }).value;
        } catch (__) {
            return '';
        }
    }
});

// Markdown查看器组件
const MarkdownViewer = ({ content }: { content: string }) => {
    return (
        <MdEditor
            value={content}
            view={{ menu: false, md: false, html: true }}
            canView={{ menu: false, md: false, html: true, fullScreen: false, hideMenu: false, both: false }}
            readOnly={true}
            className="border-none shadow-none pl-8"
            style={{ backgroundColor: 'transparent' }}
            renderHTML={(text) => (
                <div dangerouslySetInnerHTML={{ __html: mdParser.render(text) }} />
            )}
        />
    );
};


export const ArticleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<articleType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticleDetail();
    }, [id]);

    const fetchArticleDetail = async () => {
        try {
            const res = await articleDetail(id as string);
            if (res.code === 2000) {
                setArticle(res.data);
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            console.error('获取文章详情失败:', error);
        } finally {
            setLoading(false);
        }
    };

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
                <MarkdownViewer content={article.content} />
            </Col>

            <Col span={6} style={{ backgroundColor: '#ffffff', padding: '0px' }}>
            </Col>
        </Row>
    );
};
