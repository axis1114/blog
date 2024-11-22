import { Tag } from '../types/blog'

interface TagFilterProps {
  tags: Tag[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

const TagFilter = ({ tags, selectedTags, onChange }: TagFilterProps) => {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag.id}
          onClick={() => toggleTag(tag.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium
            ${selectedTags.includes(tag.id)
              ? `bg-${tag.color}-500 text-white`
              : `bg-${tag.color}-100 text-${tag.color}-800 dark:bg-${tag.color}-900 dark:text-${tag.color}-200`
            } hover:opacity-80 transition-opacity duration-200`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}

export default TagFilter 