'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore, IntakeFormData } from '@/lib/store'

export default function IntakePage() {
  const router = useRouter()
  const { createDraftFromIntake } = useAppStore()
  
  const [formData, setFormData] = useState<IntakeFormData>({
    productName: '',
    audience: '',
    problem: '',
    whyCurrentFails: '',
    promise: '',
    mustHaves: '',
    notNow: '',
    constraints: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createDraftFromIntake(formData)
    router.push('/insight')
  }

  const handleInputChange = (field: keyof IntakeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Let's define your product.</h1>
        <p className="text-muted-foreground mt-2">
          Answer in plain language. We'll handle the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium mb-2">
                What's your product called?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Give it a name that reflects what it does or who it's for.
              </p>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="e.g., CashPilot, ChairPro, TaskMaster"
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium mb-2">
                Who is this for?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe your target users in simple terms.
              </p>
              <Input
                id="audience"
                value={formData.audience}
                onChange={(e) => handleInputChange('audience', e.target.value)}
                placeholder="e.g., Solo entrepreneurs, Small business owners, Freelancers"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Problem & Solution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="problem" className="block text-sm font-medium mb-2">
                What problem does it solve?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe the core problem your product addresses.
              </p>
              <Textarea
                id="problem"
                value={formData.problem}
                onChange={(e) => handleInputChange('problem', e.target.value)}
                placeholder="e.g., Small businesses struggle to track cash flow in real-time, leading to poor financial decisions..."
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="whyCurrentFails" className="block text-sm font-medium mb-2">
                Why do current solutions fall short?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                What's wrong with existing tools or approaches?
              </p>
              <Textarea
                id="whyCurrentFails"
                value={formData.whyCurrentFails}
                onChange={(e) => handleInputChange('whyCurrentFails', e.target.value)}
                placeholder="e.g., Existing tools are too complex, expensive, or don't integrate with existing workflows..."
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="promise" className="block text-sm font-medium mb-2">
                What's your core promise?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                What will users get that they can't get elsewhere?
              </p>
              <Textarea
                id="promise"
                value={formData.promise}
                onChange={(e) => handleInputChange('promise', e.target.value)}
                placeholder="e.g., Automated cash flow tracking that works in the background, giving you insights without the work..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features & Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="mustHaves" className="block text-sm font-medium mb-2">
                What features are essential? (one per line)
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                List the core features that make your product valuable.
              </p>
              <Textarea
                id="mustHaves"
                value={formData.mustHaves}
                onChange={(e) => handleInputChange('mustHaves', e.target.value)}
                placeholder="Real-time cash flow tracking&#10;Automated categorization&#10;Financial forecasting&#10;Integration with bank accounts"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="notNow" className="block text-sm font-medium mb-2">
                What features can wait? (one per line)
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Features that would be nice but aren't critical for launch.
              </p>
              <Textarea
                id="notNow"
                value={formData.notNow}
                onChange={(e) => handleInputChange('notNow', e.target.value)}
                placeholder="Mobile app&#10;Advanced reporting&#10;Team collaboration&#10;API for third-party integrations"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="constraints" className="block text-sm font-medium mb-2">
                Any constraints or limitations?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Budget, timeline, technical, or business constraints.
              </p>
              <Textarea
                id="constraints"
                value={formData.constraints}
                onChange={(e) => handleInputChange('constraints', e.target.value)}
                placeholder="Must launch within 3 months&#10;Budget under $50k&#10;Must work offline&#10;Compliance with financial regulations"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Generate Insight
          </Button>
        </div>
      </form>
    </div>
  )
}