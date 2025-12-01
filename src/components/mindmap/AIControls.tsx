'use client'

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useMindMapStore } from '@/lib/mindmap/store'

interface AIControlsProps {
  isOpen: boolean
  onClose: () => void
  initialText?: string
  hasJourneyData?: boolean
}

export function AIControls({ isOpen, onClose, initialText = '', hasJourneyData = false }: AIControlsProps) {
  const [textInput, setTextInput] = useState(initialText)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { importGraph } = useMindMapStore()

  // Update text when initial text changes
  useEffect(() => {
    if (initialText) {
      setTextInput(initialText)
    }
  }, [initialText])

  const handleGenerate = async () => {
    if (!textInput.trim() && !imageFile) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          image: imageFile ? await fileToBase64(imageFile) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate mind map')
      }

      const data = await response.json()
      importGraph(data)
      onClose()
    } catch (error) {
      logger.error('Error generating mind map:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {hasJourneyData ? '✨ Generate Mind Map from Your Journey' : 'Generate AI Mind Map'}
          </CardTitle>
          {hasJourneyData && (
            <p className="text-sm text-muted-foreground mt-2">
              We&apos;ve pre-loaded your journey data below. Click Generate to create your mind map, or edit the text first.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {hasJourneyData ? 'Your Journey Summary' : 'Describe your idea or paste your Insight brief'}
            </label>
            <Textarea
              placeholder="e.g., 'Create a mobile app for busy parents to track their children's activities and coordinate with other parents...'"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={hasJourneyData ? 12 : 4}
              className={hasJourneyData ? 'font-mono text-sm' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload a whiteboard sketch or image (optional)
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || (!textInput.trim() && !imageFile)}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Mind Map'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
