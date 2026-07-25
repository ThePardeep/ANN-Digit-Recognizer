interface ToolbarProps {
  brushSize: number
  onBrushSizeChange: (size: number) => void
  onClear: () => void
  onUndo: () => void
  onPredict: () => void
  canUndo: boolean
  isPredicting: boolean
}

const BRUSH_SIZES = [8, 14, 20, 28]

export function Toolbar({
  brushSize,
  onBrushSizeChange,
  onClear,
  onUndo,
  onPredict,
  canUndo,
  isPredicting,
}: ToolbarProps) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <div>
        <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Brush size
        </span>
        <div className="flex gap-2">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onBrushSizeChange(size)}
              aria-pressed={brushSize === size}
              aria-label={`Brush size ${size}`}
              className={`flex flex-1 items-center justify-center rounded-lg border py-2 transition-colors ${
                brushSize === size
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400'
              }`}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: size / 2, height: size / 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Clear
        </button>
      </div>

      <button
        type="button"
        onClick={onPredict}
        disabled={isPredicting}
        className="rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPredicting ? 'Predicting...' : 'Predict'}
      </button>
    </div>
  )
}
