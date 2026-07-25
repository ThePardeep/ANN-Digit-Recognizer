import { useMutation } from '@tanstack/react-query'
import { predictDigit } from '../services/api'
import type { PredictionResponse } from '../types/prediction'

export function usePrediction() {
  const mutation = useMutation<PredictionResponse, Error, string>({
    mutationFn: (base64Image: string) => predictDigit({ image: base64Image }),
  })

  return {
    predict: mutation.mutate,
    predictAsync: mutation.mutateAsync,
    reset: mutation.reset,
    result: mutation.data,
    error: mutation.error,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  }
}
