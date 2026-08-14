import Link from 'next/link'

export default function ProviderNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight">NOT FOUND</h1>
        <p className="mt-2 text-sm text-black/50">This provider does not exist or has been removed.</p>
        <Link
          href="/professionals"
          className="mt-6 inline-block border border-black px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
        >
          BROWSE PROFESSIONALS
        </Link>
      </div>
    </div>
  )
}
