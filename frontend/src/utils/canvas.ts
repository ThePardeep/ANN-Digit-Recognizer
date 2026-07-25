export interface Point {
  x: number
  y: number
}

export interface Stroke {
  points: Point[]
  brushSize: number
}

export function getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length === 0) return

  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = stroke.brushSize
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (stroke.points.length === 1) {
    const [point] = stroke.points
    ctx.beginPath()
    ctx.arc(point.x, point.y, stroke.brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.restore()
    return
  }

  ctx.beginPath()
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
  }
  ctx.stroke()
  ctx.restore()
}

export function redrawStrokes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strokes: Stroke[],
): void {
  clearCanvas(ctx, width, height)
  strokes.forEach((stroke) => drawStroke(ctx, stroke))
}

export function isCanvasBlank(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  const { data } = ctx.getImageData(0, 0, width, height)
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    if (r !== 255 || g !== 255 || b !== 255) return false
  }
  return true
}
