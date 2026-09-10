'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Move } from 'lucide-react'

interface ArtifactViewerProps {
  src: string
  title: string
  label?: string
  aspectRatio?: string
  footer?: string
  /** Fires whenever the zoomed-in state changes, for callers that need to
   * gate their own gestures (e.g. swipe-to-advance) while zoomed. */
  onZoomChange?: (zoomed: boolean) => void
}

/**
 * Zoomable, pannable viewer for confidential work artefacts. The header
 * accent dot picks up the owning case study's colour.
 */
export function ArtifactViewer({
  src,
  title,
  label = 'Work artefact',
  aspectRatio = '16/10',
  footer,
  onZoomChange,
}: ArtifactViewerProps) {
  const MIN_SCALE = 1
  const MAX_SCALE = 4
  const STEP = 0.75

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)

  const block = (e: React.MouseEvent | React.DragEvent) => e.preventDefault()

  const zoomIn = () => setScale((s) => Math.min(s + STEP, MAX_SCALE))
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(s - STEP, MIN_SCALE)
      if (next <= MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }
  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setOffsetStart({ ...offset })
  }

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      setOffset({
        x: offsetStart.x + (e.clientX - dragStart.x),
        y: offsetStart.y + (e.clientY - dragStart.y),
      })
    },
    [isDragging, dragStart, offsetStart]
  )

  const onMouseUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  useEffect(() => {
    onZoomChange?.(scale > 1)
  }, [scale, onZoomChange])

  return (
    <div className="my-10 rounded-xl overflow-hidden border border-line shadow-card" style={{ maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-inverted">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-on-inverted/15" />
            <span className="w-2 h-2 rounded-full bg-on-inverted/15" />
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          </div>
          <span className="text-2xs font-semibold uppercase tracking-widest text-on-inverted/40 whitespace-nowrap">
            {label}
          </span>
          <span className="text-2xs text-on-inverted/25" aria-hidden="true">·</span>
          <span className="text-xs text-on-inverted/60 truncate">{title}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-1.5 rounded text-on-inverted/50 hover:text-on-inverted/85 hover:bg-on-inverted/[0.08] disabled:opacity-25 disabled:cursor-default transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-2xs text-on-inverted/40 w-9 text-center tabular-nums select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-1.5 rounded text-on-inverted/50 hover:text-on-inverted/85 hover:bg-on-inverted/[0.08] disabled:opacity-25 disabled:cursor-default transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
          {scale > 1 && (
            <button
              onClick={reset}
              className="ml-1.5 px-2 py-1 text-2xs font-medium rounded border border-on-inverted/[0.15] text-on-inverted/45 hover:text-on-inverted/75 hover:border-on-inverted/30 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-inverted select-none"
        style={{
          aspectRatio,
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onContextMenu={block}
        onDragStart={block}
        onMouseDown={onMouseDown}
        onClick={scale === 1 ? zoomIn : undefined}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            draggable={false}
            onContextMenu={block}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              userSelect: 'none',
            }}
          />
        </div>

        {/* Zoom and pan hints */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-inverted-soft backdrop-blur-sm pointer-events-none"
          aria-hidden="true"
        >
          {scale === 1 ? (
            <>
              <ZoomIn size={11} className="text-on-inverted/55" />
              <span className="text-2xs text-on-inverted/55">Click to zoom · drag to pan</span>
            </>
          ) : (
            <>
              <Move size={11} className="text-on-inverted/55" />
              <span className="text-2xs text-on-inverted/55">Drag to pan</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-inverted flex items-center justify-between border-t border-on-inverted/[0.06]">
        <span className="text-2xs text-on-inverted/30 select-none">
          {footer ?? 'Confidential'}
        </span>
        <span className="text-2xs text-on-inverted/25 select-none">Protected</span>
      </div>
    </div>
  )
}
