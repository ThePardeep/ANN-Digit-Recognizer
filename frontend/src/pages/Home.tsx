import { useRef, useState } from 'react'
import { Canvas, type CanvasHandle } from '../components/Canvas'
import { Toolbar } from '../components/Toolbar'
import { Loader } from '../components/Loader'
import { PredictionCard } from '../components/PredictionCard'
import { ThemeToggle } from '../components/ThemeToggle'
import { usePrediction } from '../hooks/usePrediction'
import { useTheme } from '../hooks/useTheme'

export function Home() {
  const canvasRef = useRef<CanvasHandle>(null)
  const [brushSize, setBrushSize] = useState(20)
  const [strokeCount, setStrokeCount] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const { predict, result, error, isLoading, isSuccess, reset } = usePrediction()

  const handlePredict = () => {
    setValidationError(null)
    const canvas = canvasRef.current
    if (!canvas || !canvas.hasDrawing()) {
      setValidationError('Please draw a digit before predicting.')
      return
    }
    const base64 = canvas.exportAsBase64()
    if (!base64) {
      setValidationError('Could not read the drawing. Please try again.')
      return
    }
    predict(base64)
  }

  const handleClear = () => {
    canvasRef.current?.clear()
    setStrokeCount(0)
    setValidationError(null)
    reset()
  }

  const handleUndo = () => {
    canvasRef.current?.undo()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10">
        <header className="mb-8 flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Handwritten Digit Recognition</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Draw a digit from 0-9 and let the neural network guess it.
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
          <div className="flex flex-col items-center gap-4">
            <Canvas
              ref={canvasRef}
              brushSize={brushSize}
              size={320}
              onStrokesChange={setStrokeCount}
            />
            <Toolbar
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              onClear={handleClear}
              onUndo={handleUndo}
              onPredict={handlePredict}
              canUndo={strokeCount > 0}
              isPredicting={isLoading}
            />
          </div>

          <div className="flex w-full max-w-sm flex-col items-center gap-4">
            {validationError && (
              <div className="w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {validationError}
              </div>
            )}

            {error && (
              <div className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                {error.message}
              </div>
            )}

            {isLoading && <Loader label="Predicting digit..." />}

            {isSuccess && result && !isLoading && <PredictionCard result={result} />}

            {!isLoading && !isSuccess && !error && !validationError && (
              <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">
                Your prediction will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
