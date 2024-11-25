import { List } from 'antd';
import { Comment } from '@ant-design/compatible';
import { commentType } from '../../api/comment';

type CommentAreaProps = {
    comments: commentType[];
};

export const CommentArea = ({ comments }: CommentAreaProps) => {
    const renderComment = (comment: commentType, index: number) => (
        <Comment
            key={`${comment.id}-${index}`}
            author={
                <span className="text-gray-900 font-bold text-base">
                    {comment.user.nick_name}
                </span>
            }
            content={
                <div className="text-gray-700 text-sm leading-relaxed">
                    {comment.content}
                </div>
            }
            datetime={
                <span className="text-gray-400 text-xs">
                    {comment.created_at}
                </span>
            }
            className="bg-white px-4 py-3 border-b border-gray-200"
        >
            {comment.sub_comments?.map((subComment, subIndex) => (
                <div className="pl-8 mt-4 border-l-2 border-gray-200">
                    {renderComment(subComment, subIndex)}
                </div>
            ))}
        </Comment>
    );

    return (
        <List
            className="max-h-[calc(100vh-64px)] overflow-y-auto divide-y divide-gray-200"
            dataSource={comments || []}
            header={
                <div className="px-4 py-2 bg-gray-100 font-medium text-lg text-gray-900">
                    {`${comments?.length || 0} 条评论`}
                </div>
            }
            itemLayout="horizontal"
            renderItem={(comment, index) => renderComment(comment, index)}
        />
    );
};