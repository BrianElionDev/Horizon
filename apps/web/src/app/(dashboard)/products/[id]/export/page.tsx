'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, FileText, Loader2, Printer, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useIdea, useContextAreaFull } from '@/lib/hooks/use-ideas'
import { CONTEXT_AREAS } from '@horizon/shared'
import type { ContextAreaContent } from '@horizon/shared'
import ReactMarkdown from 'react-markdown'

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function buildMarkdown(idea: { name: string; description: string | null; status: string }, allContent: ContextAreaContent[], exportedAt: string): string {
  const lines: string[] = []
  lines.push(`# ${idea.name}`)
  lines.push('')
  if (idea.description) lines.push(`${idea.description}`)
  lines.push('')
  lines.push(`_Exported ${new Date(exportedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}_`)
  lines.push(`_Status: ${idea.status}_`)
  lines.push('')

  const contents = allContent ?? []
  contents.forEach((area: ContextAreaContent) => {
    const areaMeta = CONTEXT_AREAS.find((a) => a.key === area.areaKey)
    const accepted = area.sections.filter((s: { status: string }) => s.status === 'accepted')
    lines.push(`---`)
    lines.push('')
    lines.push(`## ${areaMeta?.name ?? area.areaKey} (${area.completeness}%)`)
    lines.push('')

    if (accepted.length === 0) {
      lines.push('*No accepted sections yet*')
      lines.push('')
    } else {
      accepted.forEach((s: { title: string; content: string }) => {
        lines.push(`### ${s.title}`)
        lines.push('')
        lines.push(s.content)
        lines.push('')
      })
    }

    if (area.gaps.length > 0) {
      lines.push(`**Gaps:**`)
      lines.push('')
      area.gaps.forEach((g) => {
        lines.push(`- **${g.title}** (${g.action === 'agent' ? 'AI can fill' : 'Needs research'}): ${g.reason}`)
      })
      lines.push('')
    }
  })

  if (contents.length === 0) {
    lines.push('*No content structured yet. Add and structure content before exporting.*')
    lines.push('')
  }

  return lines.join('\n')
}

const previewStyles = `
#document-preview {
  background: hsl(224, 71%, 6%);
  color: hsl(210, 40%, 78%);
  font-size: 14px;
  line-height: 1.7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
#document-preview h1 {
  font-size: 26px;
  font-weight: 700;
  color: hsl(213, 85%, 72%);
  letter-spacing: -0.02em;
  margin: 0 0 6px 0;
}
#document-preview h2 {
  font-size: 18px;
  font-weight: 600;
  color: hsl(142, 70%, 60%);
  margin: 28px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid hsl(220, 30%, 22%);
}
#document-preview h3 {
  font-size: 15px;
  font-weight: 600;
  color: hsl(200, 75%, 65%);
  margin: 18px 0 8px 0;
}
#document-preview p {
  margin: 0 0 10px 0;
}
#document-preview strong {
  color: hsl(210, 60%, 82%);
  font-weight: 600;
}
#document-preview em {
  color: hsl(210, 35%, 62%);
}
#document-preview ul,
#document-preview ol {
  margin: 0 0 10px 20px;
}
#document-preview li {
  margin-bottom: 4px;
}
#document-preview hr {
  border: none;
  border-top: 1px solid hsl(220, 30%, 20%);
  margin: 24px 0;
}
#document-preview code {
  background: hsl(220, 30%, 14%);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: hsl(280, 65%, 75%);
}
#document-preview pre {
  background: hsl(220, 30%, 10%);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
  border: 1px solid hsl(220, 25%, 18%);
}
#document-preview pre code {
  background: none;
  padding: 0;
  color: hsl(210, 40%, 78%);
}
#document-preview blockquote {
  border-left: 3px solid hsl(221, 83%, 35%);
  padding-left: 14px;
  color: hsl(210, 35%, 62%);
  margin: 10px 0;
}
#document-preview a {
  color: hsl(221, 83%, 68%);
  text-decoration: underline;
  text-underline-offset: 2px;
}
#document-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}
#document-preview th,
#document-preview td {
  border: 1px solid hsl(220, 25%, 20%);
  padding: 6px 10px;
  text-align: left;
  font-size: 13px;
}
#document-preview th {
  background: hsl(220, 30%, 12%);
  color: hsl(210, 60%, 82%);
  font-weight: 600;
}
`;

function DocumentPreview({ markdown, idea }: { markdown: string; idea: { name: string; status: string } }) {
  return (
    <div className="rounded-xl border border-[hsl(220,40%,20%)] overflow-hidden shadow-lg shadow-black/30">
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: 'linear-gradient(135deg, hsl(224,70%,8%), hsl(220,60%,10%))',
          borderBottom: '1px solid hsl(220,30%,18%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: 'hsl(142,71%,45%)', boxShadow: '0 0 6px hsl(142,71%,45%)' }}
          />
          <h3
            className="text-sm font-semibold"
            style={{ color: 'hsl(210,55%,80%)' }}
          >
            Document Preview
          </h3>
        </div>
        <Badge variant="outline">{idea.status}</Badge>
      </div>
      <div
        id="document-preview"
        className="max-w-none px-8 py-6 min-h-50 max-h-[70vh] overflow-y-auto"
      >
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const { data: idea, isLoading: ideaLoading, isError, refetch } = useIdea(id)
  const { data: allContent, isLoading: contentLoading } = useContextAreaFull(id)
  const [exporting, setExporting] = useState<'markdown' | 'pdf' | null>(null)

  const isLoading = ideaLoading || contentLoading

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
        <div className="h-6 w-48 rounded bg-[hsl(var(--muted))]" />
        <div className="space-y-4">
          <div className="h-100 rounded-xl bg-[hsl(var(--muted))]" />
          {[1, 2].map(n => <div key={n} className="h-28 rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      </div>
    )
  }

  if (isError || !idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Could not load this idea.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  const slug = idea.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const exportedAt = new Date().toISOString()
  const markdown = buildMarkdown(idea, allContent ?? [], exportedAt)

  const handleMarkdown = () => {
    setExporting('markdown')
    setTimeout(() => {
      downloadBlob(`${slug}-export.md`, markdown, 'text/markdown')
      setExporting(null)
    }, 100)
  }

  const handlePdf = () => {
    setExporting('pdf')

    const preview = document.getElementById('document-preview')
    if (!preview) {
      setExporting(null)
      return
    }

    const width = 1600 // wide enough to show full letter page in print dialog
    const html = preview.innerHTML

    const printWindow = window.open('', '_blank', `width=${width + 40},height=600`)
    if (!printWindow) {
      setExporting(null)
      return
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${idea.name} - Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body {
      background: #0d1b2a !important;
      margin: 0 !important;
      padding: 24pt 20pt !important;
      min-height: 100vh;
    }
    .export-page {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #c8d6e5;
      line-height: 1.7;
      font-size: 11pt;
      margin: 0 auto;
      padding: 0;
    }
    h1 {
      font-size: 24pt;
      font-weight: 700;
      color: #7dd3fc;
      letter-spacing: -0.02em;
      margin-bottom: 8pt;
    }
    h2 {
      font-size: 16pt;
      font-weight: 600;
      color: #6ee7b7;
      margin: 24pt 0 8pt 0;
      padding-bottom: 4pt;
      border-bottom: 1px solid #2a3a4a;
      page-break-after: avoid;
    }
    h3 {
      font-size: 13pt;
      font-weight: 600;
      color: #67e8f9;
      margin: 16pt 0 6pt 0;
      page-break-after: avoid;
    }
    p { margin: 0 0 10pt 0; }
    ul, ol { margin: 0 0 10pt 20pt; }
    li { margin-bottom: 4pt; }
    hr {
      border: none;
      border-top: 1px solid #1b2838;
      margin: 24pt 0;
    }
    strong {
      color: #e2e8f0;
      font-weight: 600;
    }
    em { font-style: italic; color: #8899aa; }
    code {
      background: #152232;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 9pt;
      color: #d8b4fe;
    }
    pre {
      background: #0f1a28;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 10pt 0;
      border: 1px solid #1b2838;
    }
    pre code { background: none; padding: 0; color: #c8d6e5; }
    blockquote {
      border-left: 3px solid #2563eb;
      padding-left: 12px;
      color: #8899aa;
      margin: 10pt 0;
    }
    a {
      color: #38bdf8;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    th, td {
      border: 1px solid #1b2838;
      padding: 6px 10px;
      text-align: left;
      font-size: 10pt;
    }
    th {
      background: #111827;
      color: #e2e8f0;
      font-weight: 600;
    }
    @media print {
      .export-page { font-size: 10.5pt; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0a0e27;">
<div class="export-page">${html}</div>
</body>
</html>
    `)
    printWindow.document.close()

    // Wait for images and fonts to load, then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
      setExporting(null)
    }, 500)
  }

  return (
    <div>
      <Link
        href={`/products/${id}/overview`}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Overview
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Export</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{idea.name}</p>
      </div>

      {/* Document Preview */}
      <div className="mb-6">
        <DocumentPreview markdown={markdown} idea={idea} />
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          className="gap-1.5"
          disabled={exporting !== null}
          onClick={handlePdf}
        >
          {exporting === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
          {exporting === 'pdf' ? 'Generating PDF…' : 'Export PDF'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={exporting !== null}
          onClick={handleMarkdown}
        >
          {exporting === 'markdown' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
          {exporting === 'markdown' ? 'Generating…' : 'Export Markdown'}
        </Button>
      </div>
    </div>
  )
}