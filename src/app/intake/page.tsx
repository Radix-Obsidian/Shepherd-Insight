'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';

interface IntakeFormState {
  name: string;
  audience: string;
  problem: string;
  whyCurrentFails: string;
  promise: string;
  mustHaves: string;
  notNow: string;
  constraints: string;
}

const initialState: IntakeFormState = {
  name: '',
  audience: '',
  problem: '',
  whyCurrentFails: '',
  promise: '',
  mustHaves: '',
  notNow: '',
  constraints: '',
};

export default function IntakePage() {
  const router = useRouter();
  const createProjectFromIntake = useAppStore(s => s.createProjectFromIntake);
  const [formData, setFormData] = React.useState<IntakeFormState>(initialState);

  function toList(value: string) {
    return value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
  }

  function handleInputChange(field: keyof IntakeFormState, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { projectId, versionId } = createProjectFromIntake({
      name: formData.name,
      audience: formData.audience,
      problem: formData.problem,
      whyCurrentFails: formData.whyCurrentFails,
      promise: formData.promise,
      mustHaves: toList(formData.mustHaves),
      notNow: toList(formData.notNow),
      constraints: formData.constraints,
    });
    router.push(`/insight?projectId=${projectId}&versionId=${versionId}`);
    setFormData(initialState);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Let&apos;s define your product.</h1>
        <p className="text-muted-foreground mt-2">
          Answer in plain language. We&apos;ll handle the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                What&apos;s your product called?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Give it a name that reflects what it does or who it&apos;s for.
              </p>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                placeholder="e.g., CashPilot, ChairPro, TaskMaster"
                required
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
                onChange={(event) => handleInputChange('audience', event.target.value)}
                placeholder="e.g., Solo entrepreneurs, Small business owners, Freelancers"
                required
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
                onChange={(event) => handleInputChange('problem', event.target.value)}
                placeholder="e.g., Small businesses struggle to track cash flow in real-time, leading to poor financial decisions..."
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="whyCurrentFails" className="block text-sm font-medium mb-2">
                Why do current solutions fall short?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                What&apos;s wrong with existing tools or approaches?
              </p>
              <Textarea
                id="whyCurrentFails"
                value={formData.whyCurrentFails}
                onChange={(event) => handleInputChange('whyCurrentFails', event.target.value)}
                placeholder="e.g., Existing tools are too complex, expensive, or don&apos;t integrate with existing workflows..."
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="promise" className="block text-sm font-medium mb-2">
                What&apos;s your core promise?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                What will users get that they can&apos;t get elsewhere?
              </p>
              <Textarea
                id="promise"
                value={formData.promise}
                onChange={(event) => handleInputChange('promise', event.target.value)}
                placeholder="e.g., Automated cash flow tracking that works in the background, giving you insights without the work..."
                rows={3}
                required
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
                onChange={(event) => handleInputChange('mustHaves', event.target.value)}
                placeholder="e.g., Real-time dashboard
Automated categorization
Alerts for anomalies"
                rows={4}
                required
              />
            </div>

            <div>
              <label htmlFor="notNow" className="block text-sm font-medium mb-2">
                What should wait until later? (one per line)
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Capture future ideas so everyone knows they are parked.
              </p>
              <Textarea
                id="notNow"
                value={formData.notNow}
                onChange={(event) => handleInputChange('notNow', event.target.value)}
                placeholder="e.g., Advanced analytics
Marketplace integrations"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="constraints" className="block text-sm font-medium mb-2">
                Any constraints or guardrails?
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Share timelines, budgets, or dependencies the team should respect.
              </p>
              <Textarea
                id="constraints"
                value={formData.constraints}
                onChange={(event) => handleInputChange('constraints', event.target.value)}
                placeholder="e.g., Launch within 90 days; budget capped at $15k; must integrate with QuickBooks."
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
  );
}
