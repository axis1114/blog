import { Link } from 'react-router-dom'
import { BlogPost } from '../types/blog'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface BlogCardProps {
  post: BlogPost
}

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/blog/${post.id}`}>
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          {post.tags.map(tag => (
            <span
              key={tag.id}
              className={`inline-block px-2 py-1 text-xs rounded-full
                bg-${tag.color}-100 text-${tag.color}-800
                dark:bg-${tag.color}-900 dark:text-${tag.color}-200`}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <Link to={`/blog/${post.id}`}>
          <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {post.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {post.author.name}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {post.publishDate}
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {post.readingTime}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard 