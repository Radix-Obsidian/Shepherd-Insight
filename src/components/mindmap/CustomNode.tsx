'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { NODE_TEXT_COLORS } from '@/lib/mindmap/types'

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      // TODO: Update node label in store
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setLabel(data.label)
    }
  }, [data.label])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    // TODO: Update node label in store
  }, [])

  return (
    <div
      className={`px-4 py-2 rounded-xl shadow-md border-2 min-w-[120px] ${
        selected ? 'border-blue-500' : 'border-transparent'
      }`}
      style={{
        backgroundColor: data.color,
        color: NODE_TEXT_COLORS[data.type as keyof typeof NODE_TEXT_COLORS],
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        style={{ background: '#555' }}
      />
      
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="bg-transparent border-none outline-none text-inherit font-medium w-full"
          autoFocus
        />
      ) : (
        <div className="font-medium text-center">
          {label}
        </div>
      )}
      
      <div className="text-xs text-center mt-1 opacity-80">
        {data.type}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        style={{ background: '#555' }}
      />
    </div>
  )
})

CustomNode.displayName = 'CustomNode'
