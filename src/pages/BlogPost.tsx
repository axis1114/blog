import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { BlogPost } from '../types/blog'
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import CommentSection from '../components/CommentSection'
import MarkdownRenderer from '../components/MarkdownRenderer'
import RelatedPosts from '../components/RelatedPosts'

// 模拟文章详情数据
const MOCK_POST: BlogPost = {
  id: '1',
  title: 'React 18 新特性详解',
  summary: 'React 18 带来了许多激动人心的新特性，包括并发渲染、自动批处理等...',
  content: `
# React 18 新特性详解

React 18 是一个重要的版本更新，带来了许多激动人心的新特性。

## 1. 并发渲染

并发渲染是 React 18 最重要的新特性之一。它允许 React 同时准备多个版本的 UI。

\`\`\`jsx
function App() {
  const [isPending, startTransition] = useTransition();
  
  return (
    <div>
      {isPending && <Spinner />}
      <Component />
    </div>
  );
}
\`\`\`

## 2. 自动批处理

React 18 改进了批处理机制，可以自动将多个状态更新合并为一次重渲染。

## 3. Suspense 改进

Suspense 组件得到了重要改进，现在可以在服务端渲染中使用。
  `,
  coverImage: 'https://picsum.photos/1200/600',
  tags: [
    { id: '1', name: 'React', color: 'blue' },
    { id: '2', name: '前端', color: 'green' }
  ],
  publishDate: '2024-02-20',
  readingTime: '5 min',
  author: {
    name: '张三',
    avatar: 'https://i.pravatar.cc/150?u=1'
  }
}

const BlogPostPage = () => {
  const { id } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API请求
    const fetchPost = async () => {
      setLoading(true)
      try {
        // 实际项目中这里应该调用API
        await new Promise(resolve => setTimeout(resolve, 500))
        setPost(MOCK_POST)
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) {
    return <BlogPostSkeleton />
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">文章未找到</h1>
        <Link to="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
          返回文章列表
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <Link
        to="/blog"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4 md:mb-8"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        返回文章列表
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* 文章头部 */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full"
              />
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {post.publishDate}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-4 h-4 mr-1" />
              {post.readingTime}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {post.tags.map(tag => (
              <span
                key={tag.id}
                className={`inline-block px-2 md:px-3 py-1 text-xs md:text-sm rounded-full
                  bg-${tag.color}-100 text-${tag.color}-800
                  dark:bg-${tag.color}-900 dark:text-${tag.color}-200`}
              >
                {tag.name}
              </span>
            ))}
          </div>

          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full rounded-lg shadow-lg"
          />
        </header>

        {/* 文章内容 */}
        <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* 评论区 */}
      <div className="max-w-3xl mx-auto mt-16">
        <CommentSection postId={post.id} />
      </div>

      {/* 相关文章 */}
      <div className="max-w-3xl mx-auto mt-16">
        <RelatedPosts currentPostId={post.id} tags={post.tags} />
      </div>
    </div>
  )
}

// 加载骨架屏组件
const BlogPostSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
      <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
        </div>
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  )
}

export default BlogPostPage 