export function canvasToBase64Png(canvas: HTMLCanvasElement): string {
  const dataUrl = canvas.toDataURL('image/png')
  return dataUrl.split(',')[1]
}
