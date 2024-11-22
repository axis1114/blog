import { SearchIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索文章..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
          dark:border-gray-600 bg-white dark:bg-gray-700
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          focus:border-transparent outline-none
          text-gray-900 dark:text-white"
      />
      <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
    </div>
  )
}

export default SearchBar 