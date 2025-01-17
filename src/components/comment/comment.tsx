import { RootState } from "@/store";
import { Comment } from "@ant-design/compatible";
import { Button, Form, Input, List, message, FormInstance } from "antd";
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
        onClick={onReply}>
        回复
      </Button>
      {isAdmin && (
        <Button
          type="link"
          className="text-red-600 hover:text-red-800 p-0 font-medium transition-colors"
          onClick={onDelete}>
          删除
        </Button>
      )}
    </div>
  </div>
);

/**
 * 评论表单组件
 * 显示评论表单和提交按钮
 */
const CommentForm = ({
  form,
  replyTo,
  isLoggedIn,
  submitting,
  onSubmit,
  onCancelReply,
  onLogin,
}: {
  form: FormInstance;
  replyTo: ReplyTo | null;
  isLoggedIn: boolean;
  submitting: boolean;
  onSubmit: (values: { content: string }) => void;
  onCancelReply: () => void;
  onLogin: () => void;
}) => {
  if (!isLoggedIn) {
    return (
      <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200">
        <p className="text-slate-700 mb-4 font-medium">登录后才能发表评论</p>
        <Button
          type="primary"
          onClick={onLogin}
          className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-sm transition-all">
          去登录
        </Button>
      </div>
    );
  }

  return (
    <Form form={form} onFinish={onSubmit} className="space-y-4 comment-form">
      <Form.Item
        name="content"
        rules={[{ max: 500, message: "评论内容不能超过500字" }]}>
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
            onClick={onCancelReply}
            type="text">
            取消回复
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={submitting}
          className="px-8 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-sm transition-all">
          {replyTo ? "回复" : "发表评论"}
        </Button>
      </Form.Item>
    </Form>
  );
};

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
  // 3. 使用自定义 Hook 管理状态
  const [form] = Form.useForm();
  const [state, setState] = useState({
    submitting: false,
    replyTo: null as ReplyTo | null,
  });

  const navigate = useNavigate();
  const { id: routeArticleId } = useParams<{ id: string }>();
  const articleId = propArticleId || routeArticleId;

  // 4. 从 Redux 获取用户状态
  const { isLoggedIn, userRole } = useSelector((state: RootState) => ({
    isLoggedIn: state.web.user.isLogin,
    userRole: state.web.user.userInfo?.role,
  }));
  const isAdmin = userRole === "admin";

  // 5. 使用 useCallback 优化方法
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
        setState((prev) => ({ ...prev, submitting: true }));
        const res = await commentCreate({
          content: values.content,
          article_id: articleId,
          parent_comment_id: state.replyTo?.id,
        });

        if (res.code === 0) {
          message.success("评论发表成功");
          form.resetFields();
          setState((prev) => ({ ...prev, replyTo: null }));
          onCommentSuccess();
        } else {
          message.error(res.message);
        }
      } catch (error) {
        console.error("评论发表失败:", error);
        message.error("评论发表失败");
      } finally {
        setState((prev) => ({ ...prev, submitting: false }));
      }
    },
    [articleId, form, onCommentSuccess, state.replyTo]
  );

  const handleReply = useCallback(
    (comment: commentType) => {
      if (!checkLogin()) return;

      setState((prev) => ({
        ...prev,
        replyTo: {
          id: comment.id,
          name: comment.user.nick_name,
        },
      }));

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

  // 6. 使用 useCallback 优化渲染评论方法
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
        className="bg-slate-50 hover:bg-indigo-50/50 transition-colors duration-200 p-4 border-2 border-slate-300">
        {comment.sub_comments?.map((subComment, subIndex) => (
          <div
            key={subComment.id}
            className="pl-6 mt-4 border-l-2 border-indigo-200">
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
          {state.replyTo ? `回复 ${state.replyTo.name}` : "发表评论"}
        </h3>
        <CommentForm
          form={form}
          replyTo={state.replyTo}
          isLoggedIn={isLoggedIn}
          submitting={state.submitting}
          onSubmit={handleSubmit}
          onCancelReply={() => setState((prev) => ({ ...prev, replyTo: null }))}
          onLogin={() =>
            navigate("/login", { state: { from: location.pathname } })
          }
        />
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
