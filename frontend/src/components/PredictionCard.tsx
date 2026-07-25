import { ConfidenceChart } from './ConfidenceChart'
import type { PredictionResponse } from '../types/prediction'

interface PredictionCardProps {
  result: PredictionResponse
}

export function PredictionCard({ result }: PredictionCardProps) {
  const { prediction, confidence, probabilities, inference_time_ms: inferenceTimeMs } = result

  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Prediction</p>
          <p className="text-5xl font-bold text-slate-900 dark:text-white">{prediction}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Confidence</p>
          <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
            {(confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Inference time: {inferenceTimeMs.toFixed(1)} ms
      </p>

      <div className="mt-4">
        <ConfidenceChart probabilities={probabilities} prediction={prediction} />
      </div>
    </div>
  )
}
