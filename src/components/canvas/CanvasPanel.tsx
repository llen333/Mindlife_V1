'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvasStore } from '@/lib/canvas/store';
import BlockPalette from './BlockPalette';
import Canvas from './Canvas';

export default function CanvasPanel() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{
    blockId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: (clientX - rect.left + el.scrollLeft) / zoom,
      y: (clientY - rect.top + el.scrollTop) / zoom,
    };
  }, [zoom]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (!type) return;
    const pos = toCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;
    useCanvasStore.getState().addBlock(type, Math.max(0, pos.x - 110), Math.max(0, pos.y - 24));
  }, [toCanvasCoords]);

  const handleBlockPointerDown = useCallback((blockId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const block = useCanvasStore.getState().blocks.find(b => b.id === blockId);
    if (!block) return;
    const pos = toCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;
    dragRef.current = {
      blockId,
      offsetX: pos.x - block.x,
      offsetY: pos.y - block.y,
    };
  }, [toCanvasCoords]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();
    const pos = toCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;
    useCanvasStore.getState().updateBlockPosition(
      drag.blockId,
      Math.max(0, pos.x - drag.offsetX),
      Math.max(0, pos.y - drag.offsetY),
    );
  }, [toCanvasCoords]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      <BlockPalette />
      <Canvas
        canvasRef={canvasRef}
        zoom={zoom}
        setZoom={setZoom}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onBlockPointerDown={handleBlockPointerDown}
      />
    </div>
  );
}
