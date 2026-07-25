import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  clearCanvas,
  drawStroke,
  getCanvasPoint,
  isCanvasBlank,
  redrawStrokes,
  type Stroke,
} from '../utils/canvas'
import { canvasToBase64Png } from '../utils/image'

export interface CanvasHandle {
  clear: () => void
  undo: () => void
  exportAsBase64: () => string | null
  hasDrawing: () => boolean
}

interface CanvasProps {
  brushSize: number
  size?: number
  onStrokesChange?: (strokeCount: number) => void
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { brushSize, size = 320, onStrokesChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const getContext = () => canvasRef.current?.getContext('2d') ?? null

  useEffect(() => {
    const ctx = getContext()
    if (!ctx || !canvasRef.current) return
    clearCanvas(ctx, canvasRef.current.width, canvasRef.current.height)
  }, [])

  useImperativeHandle(ref, () => ({
    clear: () => {
      const ctx = getContext()
      if (!ctx || !canvasRef.current) return
      strokesRef.current = []
      clearCanvas(ctx, canvasRef.current.width, canvasRef.current.height)
      onStrokesChange?.(0)
    },
    undo: () => {
      const ctx = getContext()
      if (!ctx || !canvasRef.current) return
      strokesRef.current = strokesRef.current.slice(0, -1)
      redrawStrokes(ctx, canvasRef.current.width, canvasRef.current.height, strokesRef.current)
      onStrokesChange?.(strokesRef.current.length)
    },
    exportAsBase64: () => {
      if (!canvasRef.current) return null
      return canvasToBase64Png(canvasRef.current)
    },
    hasDrawing: () => {
      const ctx = getContext()
      if (!ctx || !canvasRef.current) return false
      return !isCanvasBlank(ctx, canvasRef.current.width, canvasRef.current.height)
    },
  }))

  const startDrawing = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return
    const point = getCanvasPoint(canvasRef.current, clientX, clientY)
    currentStrokeRef.current = { points: [point], brushSize }
    setIsDrawing(true)
  }

  const continueDrawing = (clientX: number, clientY: number) => {
    if (!isDrawing || !currentStrokeRef.current || !canvasRef.current) return
    const ctx = getContext()
    if (!ctx) return

    const point = getCanvasPoint(canvasRef.current, clientX, clientY)
    currentStrokeRef.current.points.push(point)
    drawStroke(ctx, {
      points: currentStrokeRef.current.points.slice(-2),
      brushSize,
    })
  }

  const finishDrawing = () => {
    if (currentStrokeRef.current) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current]
      onStrokesChange?.(strokesRef.current.length)
    }
    currentStrokeRef.current = null
    setIsDrawing(false)
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="touch-none rounded-xl border-2 border-slate-300 bg-white shadow-inner dark:border-slate-600"
      onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
      onMouseMove={(e) => continueDrawing(e.clientX, e.clientY)}
      onMouseUp={finishDrawing}
      onMouseLeave={finishDrawing}
      onTouchStart={(e) => {
        const touch = e.touches[0]
        startDrawing(touch.clientX, touch.clientY)
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        const touch = e.touches[0]
        continueDrawing(touch.clientX, touch.clientY)
      }}
      onTouchEnd={finishDrawing}
    />
  )
})
