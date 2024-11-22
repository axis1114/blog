import MarkdownIt from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs'

interface MarkdownRendererProps {
  content: string
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
}).use(highlightjs)

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  )
}

export default MarkdownRenderer 