import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BlogPost } from '../types/blog'
import BlogCard from '../components/BlogCard'
import TagFilter from '../components/TagFilter'
import SearchBar from '../components/SearchBar'
import { useResponsive } from '../hooks/useResponsive'

// 模拟博客数据
const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'React 18 新特性详解',
    summary: 'React 18 带来了许多激动人心的新特性，包括并发渲染、自动批处理等...',
    content: '',
    coverImage: 'https://picsum.photos/800/400',
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
  },
  {
    id: '2',
    title: 'TypeScript 高级技巧',
    summary: '探索 TypeScript 中的高级类型和实用技巧，提升代码质量...',
    content: '',
    coverImage: 'https://picsum.photos/800/400?random=2',
    tags: [
      { id: '3', name: 'TypeScript', color: 'blue' },
      { id: '2', name: '前端', color: 'green' }
    ],
    publishDate: '2024-02-19',
    readingTime: '8 min',
    author: {
      name: '李四',
      avatar: 'https://i.pravatar.cc/150?u=2'
    }
  }
]

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { isMobile, isTablet } = useResponsive()

  // 获取所有唯一的标签
  const allTags = Array.from(
    new Set(MOCK_POSTS.flatMap(post => post.tags))
  )

  // 过滤文章
  const filteredPosts = MOCK_POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 ||
      post.tags.some(tag => selectedTags.includes(tag.id))
    
    return matchesSearch && matchesTags
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">博客文章</h1>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-64">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-full md:flex-1 overflow-x-auto">
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${
        isMobile 
          ? 'grid-cols-1' 
          : isTablet 
            ? 'grid-cols-2' 
            : 'grid-cols-3'
      }`}>
        {filteredPosts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            没有找到相关文章
          </p>
        </div>
      )}
    </div>
  )
}

export default BlogList 