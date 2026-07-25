interface LoaderProps {
  label?: string
}

export function Loader({ label = 'Loading...' }: LoaderProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-6"
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400" />
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  )
}
