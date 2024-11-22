export interface Tag {
  id: string
  name: string
  color: string
}

export interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  coverImage: string
  tags: Tag[]
  publishDate: string
  readingTime: string
  author: {
    name: string
    avatar: string
  }
} 