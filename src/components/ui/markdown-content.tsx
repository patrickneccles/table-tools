'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type Props = {
  content: string;
  className?: string;
};

/**
 * Renders a markdown string as formatted HTML for use inside stat/spell block previews.
 * Supports bold, italic, and GFM tables (via remark-gfm).
 */
export function MarkdownContent({ content, className }: Props) {
  if (!content) return null;
  return (
    <div className={cn('space-y-2', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          // Inline
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          // Tables
          table: ({ children }) => (
            <table className="w-full text-left text-sm border-collapse my-1">{children}</table>
          ),
          thead: ({ children }) => <thead className="border-b border-current/30">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-current/10 last:border-0">{children}</tr>
          ),
          th: ({ children }) => <th className="py-1 pr-4 font-semibold">{children}</th>,
          td: ({ children }) => <td className="py-1 pr-4">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
