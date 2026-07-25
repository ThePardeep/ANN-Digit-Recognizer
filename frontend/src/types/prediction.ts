export interface PredictionRequest {
  image: string
}

export interface PredictionResponse {
  prediction: number
  confidence: number
  probabilities: Record<string, number>
  inference_time_ms: number
}

export interface ApiErrorResponse {
  detail: string
}
