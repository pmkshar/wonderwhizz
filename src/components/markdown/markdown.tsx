'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type React from 'react'

export function Markdown({ content }: { content: string }) {
  return (
    <div className="ww-prose">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !className && !String(children).includes('\n')
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <SyntaxHighlighter
                style={oneDark as React.CSSProperties}
                language={match?.[1] ?? 'text'}
                PreTag="div"
                customStyle={{
                  background: 'transparent',
                  margin: 0,
                  padding: 0,
                  fontSize: '0.85em',
                }}
                codeTagProps={{ style: { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          pre({ children }) {
            return <pre>{children}</pre>
          },
          a({ href, children, ...props }) {
            // Render all links as safe external links opening in a new tab.
            // ReactMarkdown by default only allows http(s) and relative URLs.
            const safeHref = href && /^(https?:\/\/|\/)/i.test(href) ? href : undefined
            if (!safeHref) return <span>{children}</span>
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline"
                {...props}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
