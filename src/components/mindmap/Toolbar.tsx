'use client'

import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button'
import { 
  UserCircle, 
  AlertCircle, 
  Sparkles, 
  Lightbulb, 
  StickyNote,
  Crosshair,
  Image as ImageIcon,
  FileText,
  Presentation,
  HelpCircle
} from 'lucide-react'
import { useMindMapStore } from '@/lib/mindmap/store'
import { useReactFlow } from 'reactflow'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

interface ToolbarProps {
  canvasRef: React.RefObject<HTMLDivElement>
}

export function Toolbar({ canvasRef }: ToolbarProps) {
  const { addNode } = useMindMapStore()
  const { fitView } = useReactFlow()

  const handleAddNode = (type: 'persona' | 'pain' | 'feature' | 'idea' | 'note') => {
    addNode(type, `New ${type}`, { x: 0, y: 0 })
  }

  const handleCenterView = () => {
    fitView({ padding: 0.2 })
  }

  const getCanvasEl = () =>
    (canvasRef.current?.querySelector('.react-flow') as HTMLElement) || null

  const handleExportImage = async () => {
    const el = getCanvasEl()
    if (!el) return
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `mindmap-${Date.now()}.png`
      a.click()
    } catch (error) {
      logger.error('Export image failed:', error)
    }
  }

  const handleExportPDF = async () => {
    const el = getCanvasEl()
    if (!el) return
    try {
      const w = el.clientWidth
      const h = el.clientHeight
      const img = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 })
      const pdf = new jsPDF({
        orientation: w >= h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
      })
      pdf.addImage(img, 'PNG', 0, 0, w, h)
      pdf.save(`mindmap-${Date.now()}.pdf`)
    } catch (error) {
      logger.error('Export PDF failed:', error)
    }
  }

  const handlePresentationMode = async () => {
    const el = canvasRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      logger.error('Presentation mode failed:', error)
    }
  }

  const handleHelp = () => {
    // TODO: Implement help functionality
    logger.debug('Help')
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Add Node Buttons */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddNode('persona')}
          title="Add Persona"
        >
          <UserCircle className="h-4 w-4 mr-1" />
          Persona
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddNode('pain')}
          title="Add Pain Point"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Pain
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddNode('feature')}
          title="Add Feature"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Feature
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddNode('idea')}
          title="Add Idea"
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          Idea
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddNode('note')}
          title="Add Note"
        >
          <StickyNote className="h-4 w-4 mr-1" />
          Note
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCenterView}
          title="Center View"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* Export Controls */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportImage}
          title="Export as Image"
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Image
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportPDF}
          title="Export as PDF"
        >
          <FileText className="h-4 w-4 mr-1" />
          PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePresentationMode}
          title="Presentation Mode"
        >
          <Presentation className="h-4 w-4 mr-1" />
          Present
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* Help */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleHelp}
        title="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  )
}
