import { useState } from 'react'

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  date: string
}

interface CommentSectionProps {
  postId: string
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    author: {
      name: '王五',
      avatar: 'https://i.pravatar.cc/150?u=3'
    },
    content: '非常详细的文章，学到了很多！',
    date: '2024-02-21'
  },
  {
    id: '2',
    author: {
      name: '赵六',
      avatar: 'https://i.pravatar.cc/150?u=4'
    },
    content: '期待更多相关内容的分享。',
    date: '2024-02-21'
  }
]

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: '访客',
        avatar: 'https://i.pravatar.cc/150?u=guest'
      },
      content: newComment,
      date: new Date().toISOString().split('T')[0]
    }

    setComments([comment, ...comments])
    setNewComment('')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">评论</h2>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 
            dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          rows={4}
        />
        <button
          type="submit"
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors duration-200"
        >
          发表评论
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex space-x-4">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.author.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {comment.date}
                </span>
              </div>
              <p className="mt-1 text-gray-800 dark:text-gray-200">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentSection 