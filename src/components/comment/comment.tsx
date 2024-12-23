import { RootState } from "@/store";
import { Comment } from "@ant-design/compatible";
import { Button, Form, Input, List, message } from "antd";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { commentCreate, commentDelete, commentType } from "../../api/comment";

const { TextArea } = Input;

/**
 * CommentArea组件的属性接口定义
 * @interface CommentAreaProps
 * @property {commentType[]} comments - 评论列表数据
 * @property {Function} onCommentSuccess - 评论操作成功后的回调函数
 * @property {string} [className] - 可选的自定义样式类名
 * @property {string} [articleId] - 文章ID，可通过props传入或从路由获取
 */
interface CommentAreaProps {
  comments: commentType[];
  onCommentSuccess: () => void;
  className?: string;
  articleId?: string;
}

/**
 * 回复对象的接口定义
 * @interface ReplyTo
 * @property {number} id - 被回复评论的ID
 * @property {string} name - 被回复用户的昵称
 */
interface ReplyTo {
  id: number;
  name: string;
}

/**
 * 评论内容组件的接口定义
 * @interface CommentContentProps
 * @property {commentType} comment - 评论对象
 * @property {boolean} isAdmin - 是否为管理员
 * @property {Function} onReply - 回复评论的回调函数
 * @property {Function} onDelete - 删除评论的回调函数
 */
interface CommentContentProps {
  comment: commentType;
  isAdmin: boolean;
  onReply: () => void;
  onDelete: () => void;
}

/**
 * 评论内容组件
 * 显示评论内容、回复按钮和删除按钮（管理员可见）
 */
const CommentContent = ({
  comment,
  isAdmin,
  onReply,
  onDelete,
}: CommentContentProps) => (
  <div>
    <div className="text-slate-700 text-base leading-relaxed">
      {comment.content}
    </div>
    <div className="mt-2 space-x-4">
      <Button
        type="link"
        className="text-indigo-600 hover:text-indigo-800 p-0 font-medium transition-colors"
        onClick={onReply}
      >
        回复
      </Button>
      {isAdmin && (
        <Button
          type="link"
          className="text-red-600 hover:text-red-800 p-0 font-medium transition-colors"
          onClick={onDelete}
        >
          删除
        </Button>
      )}
    </div>
  </div>
);

/**
 * 评论区组件
 * 提供评论列表展示、发表评论、回复评论、删除评论等功能
 */
export const CommentArea = ({
  comments,
  onCommentSuccess,
  className,
  articleId: propArticleId,
}: CommentAreaProps) => {
  // 表单实例
  const [form] = Form.useForm();
  // 提交状态
  const [submitting, setSubmitting] = useState(false);
  // 回复目标状态
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const navigate = useNavigate();

  // 从Redux获取用户登录状态和角色信息
  const isLoggedIn = useSelector((state: RootState) => state.web.user.isLogin);
  const userRole = useSelector(
    (state: RootState) => state.web.user.userInfo?.role
  );
  const isAdmin = userRole === "admin";

  // 获取文章ID，优先使用props传入的ID，其次使用路由参数
  const { id: routeArticleId } = useParams<{ id: string }>();
  const articleId = propArticleId || routeArticleId;

  const checkLogin = useCallback(() => {
    if (!isLoggedIn) {
      message.warning("请先登录后再进行评论");
      navigate("/login", { state: { from: location.pathname } });
      return false;
    }
    return true;
  }, [isLoggedIn, navigate]);

  const handleSubmit = useCallback(
    async (values: { content: string }) => {
      if (!articleId) {
        message.error("文章ID不存在");
        return;
      }

      try {
        setSubmitting(true);
        const res = await commentCreate({
          content: values.content,
          article_id: articleId,
          parent_comment_id: replyTo?.id,
        });

        if (res.code === 0) {
          message.success("评论发表成功");
          form.resetFields();
          setReplyTo(null);
          onCommentSuccess();
        } else {
          message.error(res.message);
        }
      } catch (error) {
        console.error("评论发表失败:", error);
        message.error("评论发表失败");
      } finally {
        setSubmitting(false);
      }
    },
    [articleId, checkLogin, form, onCommentSuccess, replyTo]
  );

  const handleReply = useCallback(
    (comment: commentType) => {
      if (!checkLogin()) return;

      setReplyTo({
        id: comment.id,
        name: comment.user.nick_name,
      });
      // 滚动到评论框
      document.querySelector(".comment-form")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
    [checkLogin]
  );

  const handleDelete = useCallback(
    async (commentId: number) => {
      if (!checkLogin()) return;

      try {
        const res = await commentDelete(commentId);
        if (res.code === 0) {
          message.success("评论删除成功");
          onCommentSuccess();
        } else {
          message.error(res.message);
        }
      } catch (error) {
        message.error("删除评论失败");
        console.error("删除评论失败:", error);
      }
    },
    [checkLogin, onCommentSuccess]
  );

  // 渲染单条评论及其子评论
  const renderComment = useCallback(
    (comment: commentType, index: number) => (
      <Comment
        key={`${comment.id}-${index}`}
        author={
          <span className="text-slate-800 font-semibold text-base">
            {comment.user.nick_name}
          </span>
        }
        content={
          <CommentContent
            comment={comment}
            isAdmin={isAdmin}
            onReply={() => handleReply(comment)}
            onDelete={() => handleDelete(comment.id)}
          />
        }
        datetime={
          <span className="text-slate-500 text-sm">{comment.created_at}</span>
        }
        className="bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-200 p-4 border-2 border-slate-300"
      >
        {comment.sub_comments?.map((subComment, subIndex) => (
          <div
            key={subComment.id}
            className="pl-6 mt-4 border-l-2 border-indigo-200"
          >
            {renderComment(subComment, subIndex)}
          </div>
        ))}
      </Comment>
    ),
    [handleDelete, handleReply, isAdmin]
  );

  return (
    <div className={`bg-white border-2 border-slate-300 ${className}`}>
      <div className="p-6 border-b-2 border-slate-300 bg-gradient-to-b from-white to-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          {replyTo ? `回复 ${replyTo.name}` : "发表评论"}
        </h3>
        {isLoggedIn ? (
          <Form
            form={form}
            onFinish={handleSubmit}
            className="space-y-4 comment-form"
          >
            <Form.Item
              name="content"
              rules={[{ max: 500, message: "评论内容不能超过500字" }]}
            >
              <TextArea
                rows={4}
                placeholder={
                  replyTo ? `回复 ${replyTo.name}...` : "写下你的评论..."
                }
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
                {replyTo ? "回复" : "发表评论"}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200">
            <p className="text-slate-700 mb-4 font-medium">
              登录后才能发表评论
            </p>
            <Button
              type="primary"
              onClick={() =>
                navigate("/login", {
                  state: { from: location.pathname },
                })
              }
              className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-sm transition-all"
            >
              去登录
            </Button>
          </div>
        )}
      </div>
      <List
        className="divide-y-2 divide-slate-300"
        dataSource={comments || []}
        header={
          <div className="px-6 py-4 bg-slate-50 text-base font-semibold text-slate-800 border-b-2 border-slate-300">
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
