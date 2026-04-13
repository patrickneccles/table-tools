'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  markdown: string;
  isLightMode: boolean;
};

export function MarkdownView({ markdown, isLightMode }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        'rounded-md border overflow-hidden w-md',
        isLightMode ? 'border-zinc-200' : 'border-zinc-700'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between px-3 py-1.5 border-b',
          isLightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-800/60 border-zinc-700'
        )}
      >
        <span className={cn('text-xs', isLightMode ? 'text-zinc-400' : 'text-zinc-500')}>
          markdown
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-2 gap-1.5 text-xs',
            copied && (isLightMode ? 'text-emerald-600' : 'text-emerald-400')
          )}
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre
        className={cn(
          'p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto',
          'max-h-[70vh] overflow-y-auto',
          isLightMode ? 'text-zinc-800 bg-white' : 'text-zinc-200 bg-zinc-900/40'
        )}
      >
        {markdown}
      </pre>
    </div>
  );
}
