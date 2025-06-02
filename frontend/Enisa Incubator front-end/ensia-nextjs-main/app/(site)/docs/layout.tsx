export const metadata = {
  title: 'Docs',
  description: 'Documentation pages',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="docs-layout">
      {children}
    </div>
  )
}
