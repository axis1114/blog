import { List, Button, Form, Input, message } from 'antd';
import { Comment } from '@ant-design/compatible';
import { commentType, commentCreate } from '../../api/comment';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const { TextArea } = Input;

interface CommentAreaProps {
    comments: commentType[];
    onCommentSuccess: () => void;
    className?: string;
}

export const CommentArea = ({
    comments,
    onCommentSuccess,
    className
}: CommentAreaProps) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
    const { id: articleId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // 获取登录状态
    const isLoggedIn = useSelector((state: RootState) => state.web.user.isLogin);

    // 检查登录状态
    const checkLogin = () => {
        if (!isLoggedIn) {
            message.warning('请先登录后再进行评论');
            navigate('/login', { state: { from: location.pathname } });
            return false;
        }
        return true;
    };

    const handleSubmit = async (values: { content: string }) => {
        if (!checkLogin()) return;

        if (!articleId) {
            message.error('文章ID不存在');
            return;
        }

        setSubmitting(true);
        try {
            await commentCreate({
                content: values.content,
                article_id: parseInt(articleId),
                parent_comment_id: replyTo?.id
            });
            message.success('评论发表成功');
            form.resetFields();
            setReplyTo(null);
            onCommentSuccess?.();
        } catch (error) {
            message.error('评论发表失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = (comment: commentType) => {
        if (!checkLogin()) return;

        setReplyTo({
            id: comment.id,
            name: comment.user.nick_name
        });
        // 滚动到评论框
        document.querySelector('.comment-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    };

    const renderComment = (comment: commentType, index: number) => (
        <Comment
            key={`${comment.id}-${index}`}
            author={
                <span className="text-slate-800 font-semibold text-base">
                    {comment.user.nick_name}
                </span>
            }
            content={
                <div>
                    <div className="text-slate-700 text-base leading-relaxed">
                        {comment.content}
                    </div>
                    <div className="mt-2">
                        <Button
                            type="link"
                            className="text-indigo-600 hover:text-indigo-800 p-0 font-medium transition-colors"
                            onClick={() => handleReply(comment)}
                        >
                            回复
                        </Button>
                    </div>
                </div>
            }
            datetime={
                <span className="text-slate-500 text-sm">
                    {comment.created_at}
                </span>
            }
            className="bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-200 p-4 border border-slate-200"
        >
            {comment.sub_comments?.map((subComment, subIndex) => (
                <div key={subComment.id} className="pl-6 mt-4 border-l-2 border-indigo-200">
                    {renderComment(subComment, subIndex)}
                </div>
            ))}
        </Comment>
    );

    return (
        <div className={`bg-white shadow-lg border border-slate-200 ${className}`}>
            {/* 评论输入区域 */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {replyTo ? `回复 ${replyTo.name}` : '发表评论'}
                </h3>
                {isLoggedIn ? (
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        className="space-y-4 comment-form"
                    >
                        <Form.Item
                            name="content"
                            rules={[
                                { max: 500, message: '评论内容不能超过500字' }
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder={replyTo ? `回复 ${replyTo.name}...` : "写下你的评论..."}
                                className="resize-none border-slate-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                maxLength={500}
                            />
                        </Form.Item>
                        <Form.Item className="mb-0 text-right">
                            {replyTo && (
                                <Button
                                    className="mr-4 text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setReplyTo(null);
                                    }}
                                    type="text"
                                    htmlType="button"
                                >
                                    取消回复
                                </Button>
                            )}
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                className="px-8 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-sm transition-all"
                            >
                                {replyTo ? '回复' : '发表评论'}
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200">
                        <p className="text-slate-700 mb-4 font-medium">登录后才能发表评论</p>
                        <Button
                            type="primary"
                            onClick={() => navigate('/login', {
                                state: { from: location.pathname }
                            })}
                            className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-sm transition-all"
                        >
                            去登录
                        </Button>
                    </div>
                )}
            </div>

            {/* 评论列表 */}
            <List
                className="divide-y divide-slate-200"
                dataSource={comments || []}
                header={
                    <div className="px-6 py-4 bg-slate-50 text-base font-semibold text-slate-800 border-b border-slate-200">
                        {`${comments?.length || 0} 条评论`}
                    </div>
                }
                itemLayout="horizontal"
                renderItem={(comment, index) => (
                    <div className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        {renderComment(comment, index)}
                    </div>
                )}
            />
        </div>
    );
};