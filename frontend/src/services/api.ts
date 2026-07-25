import axios, { AxiosError } from 'axios'
import type { ApiErrorResponse, PredictionRequest, PredictionResponse } from '../types/prediction'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const detail = axiosError.response?.data?.detail
    if (detail) return new ApiError(detail)
    if (axiosError.code === 'ECONNABORTED')
      return new ApiError('Request timed out. Please try again.')
    if (!axiosError.response) return new ApiError('Could not reach the prediction server.')
  }
  return new ApiError('An unexpected error occurred.')
}

export async function predictDigit(payload: PredictionRequest): Promise<PredictionResponse> {
  try {
    const { data } = await apiClient.post<PredictionResponse>('/api/predict', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const { data } = await apiClient.get<{ status: string; model_loaded: boolean }>('/health')
    return data.status === 'ok' && data.model_loaded
  } catch {
    return false
  }
}
