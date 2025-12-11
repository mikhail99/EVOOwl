import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed text-slate-200" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-xl font-semibold mb-2 text-slate-100" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-2 text-slate-100" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 text-slate-100" {...props} />,
          li: ({ node, ordered, ...props }) => <li className="ml-4 list-disc text-slate-200" {...props} />,
          ul: ({ node, ...props }) => <ul className="mb-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="mb-2 space-y-1 list-decimal ml-4 text-slate-200" {...props} />,
          a: ({ node, ...props }) => <a className="text-violet-300 underline" {...props} />,
          code: ({ inline, className, children, ...props }) => (
            <code className={`bg-slate-800/70 px-1 py-0.5 rounded ${className || ''}`} {...props}>
              {children}
            </code>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
