'use client';

import { memo, useMemo } from 'react';
import { useCanvasStore } from '@/lib/canvas/store';

interface ConnectionLineProps {
  id: string;
  sourceBlockId: string;
  sourcePortId: string;
  targetBlockId: string;
  targetPortId: string;
}

function getBlockCenter(blockId: string, blocks: { id: string; x: number; y: number }[], isOutput: boolean): { x: number; y: number } {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return { x: 0, y: 0 };
  return {
    x: block.x + (isOutput ? 220 : 0),
    y: block.y + 60 + (isOutput ? 10 : 5),
  };
}

function ConnectionLineInner({ sourceBlockId, sourcePortId, targetBlockId, targetPortId }: ConnectionLineProps) {
  const blocks = useCanvasStore(s => s.blocks);
  const connectingFrom = useCanvasStore(s => s.connectingFrom);

  const isConnecting = connectingFrom && connectingFrom.blockId === sourceBlockId;

  const start = useMemo(() => getBlockCenter(sourceBlockId, blocks, true), [sourceBlockId, blocks]);
  const end = useMemo(() => getBlockCenter(targetBlockId, blocks, false), [targetBlockId, blocks]);

  const midX = (start.x + end.x) / 2;
  const d = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <path
        d={d}
        stroke={isConnecting ? '#22d3ee' : '#475569'}
        strokeWidth={2}
        fill="none"
        strokeDasharray={isConnecting ? '4 4' : undefined}
        className="transition-colors duration-300"
      />
      <circle cx={end.x} cy={end.y} r={3} fill={isConnecting ? '#22d3ee' : '#64748b'} />
    </svg>
  );
}

export const ConnectionLine = memo(ConnectionLineInner);
