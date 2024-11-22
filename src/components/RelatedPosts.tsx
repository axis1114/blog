import { Link } from 'react-router-dom'
import { BlogPost, Tag } from '../types/blog'

interface RelatedPostsProps {
  currentPostId: string
  tags: Tag[]
}

// 模拟相关文章数据
const MOCK_RELATED_POSTS: BlogPost[] = [
  {
    id: '3',
    title: 'React Hooks 最佳实践',
    summary: '深入探讨 React Hooks 的使用技巧和注意事项...',
    content: '',
    coverImage: 'https://picsum.photos/800/400?random=3',
    tags: [
      { id: '1', name: 'React', color: 'blue' },
      { id: '2', name: '前端', color: 'green' }
    ],
    publishDate: '2024-02-18',
    readingTime: '6 min',
    author: {
      name: '张三',
      avatar: 'https://i.pravatar.cc/150?u=1'
    }
  },
  {
    id: '4',
    title: 'React 性能优化指南',
    summary: '学习如何优化 React 应用的性能，提升用户体验...',
    content: '',
    coverImage: 'https://picsum.photos/800/400?random=4',
    tags: [
      { id: '1', name: 'React', color: 'blue' },
      { id: '4', name: '性能优化', color: 'red' }
    ],
    publishDate: '2024-02-17',
    readingTime: '7 min',
    author: {
      name: '李四',
      avatar: 'https://i.pravatar.cc/150?u=2'
    }
  }
]

const RelatedPosts = ({ currentPostId, tags }: RelatedPostsProps) => {
  // 过滤掉当前文章，并按相关标签数量排序
  const relatedPosts = MOCK_RELATED_POSTS
    .filter(post => post.id !== currentPostId)
    .sort((a, b) => {
      const aMatchCount = a.tags.filter(tag => 
        tags.some(t => t.id === tag.id)
      ).length
      const bMatchCount = b.tags.filter(tag => 
        tags.some(t => t.id === tag.id)
      ).length
      return bMatchCount - aMatchCount
    })
    .slice(0, 2)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">相关文章</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="block group"
          >
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md 
              overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600
                  dark:group-hover:text-blue-400">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {post.summary}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RelatedPosts 