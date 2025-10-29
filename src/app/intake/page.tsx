'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface IntakeFormState {
  problemStatement: string;
  // Advanced fields (optional)
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
  problemStatement: '',
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
  const [formData, setFormData] = React.useState<IntakeFormState>(initialState);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  function handleInputChange(field: keyof IntakeFormState, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function toList(value: string): string[] {
    return value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request body
      const requestBody: {
        problemStatement: string;
        rawFormData?: {
          name?: string;
          audience?: string;
          problem?: string;
          whyCurrentFails?: string;
          promise?: string;
          mustHaves?: string[];
          notNow?: string[];
          constraints?: string;
        };
      } = {
        problemStatement: formData.problemStatement || formData.problem,
      };

      // Include advanced fields if they're filled out
      if (showAdvanced && (
        formData.name ||
        formData.audience ||
        formData.problem ||
        formData.whyCurrentFails ||
        formData.promise ||
        formData.mustHaves ||
        formData.notNow ||
        formData.constraints
      )) {
        requestBody.rawFormData = {
          name: formData.name || undefined,
          audience: formData.audience || undefined,
          problem: formData.problem || undefined,
          whyCurrentFails: formData.whyCurrentFails || undefined,
          promise: formData.promise || undefined,
          mustHaves: formData.mustHaves ? toList(formData.mustHaves) : undefined,
          notNow: formData.notNow ? toList(formData.notNow) : undefined,
          constraints: formData.constraints || undefined,
        };
      }

      const response = await fetch('/api/intake/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create project' }));
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      
      // Redirect to insight page
      router.push(`/insight?projectId=${data.projectId}&versionId=${data.versionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Let&apos;s define your product.</h1>
        <p className="text-muted-foreground mt-2">
          Tell us what you&apos;re building, and we&apos;ll generate your insight brief automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>What are you trying to build, and who is it for?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                id="problemStatement"
                value={formData.problemStatement}
                onChange={(event) => handleInputChange('problemStatement', event.target.value)}
                placeholder="e.g., I want to build a cash flow tracking tool for solo entrepreneurs who struggle to understand their finances..."
                rows={5}
                required
                className="w-full"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Describe your product idea in plain language. Include who it&apos;s for and what problem it solves.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Fields (Collapsible) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Details (Optional)</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Product Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                  placeholder="e.g., CashPilot"
                />
              </div>

              <div>
                <label htmlFor="audience" className="block text-sm font-medium mb-2">
                  Target Audience
                </label>
                <Input
                  id="audience"
                  value={formData.audience}
                  onChange={(event) => handleInputChange('audience', event.target.value)}
                  placeholder="e.g., Solo entrepreneurs, Small business owners"
                />
              </div>

              <div>
                <label htmlFor="problem" className="block text-sm font-medium mb-2">
                  Problem Statement
                </label>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(event) => handleInputChange('problem', event.target.value)}
                  placeholder="Describe the core problem..."
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="whyCurrentFails" className="block text-sm font-medium mb-2">
                  Why Current Solutions Fail
                </label>
                <Textarea
                  id="whyCurrentFails"
                  value={formData.whyCurrentFails}
                  onChange={(event) => handleInputChange('whyCurrentFails', event.target.value)}
                  placeholder="What's wrong with existing tools?"
                  rows={2}
                />
              </div>

              <div>
                <label htmlFor="promise" className="block text-sm font-medium mb-2">
                  Core Promise
                </label>
                <Textarea
                  id="promise"
                  value={formData.promise}
                  onChange={(event) => handleInputChange('promise', event.target.value)}
                  placeholder="What makes your solution unique?"
                  rows={2}
                />
              </div>

              <div>
                <label htmlFor="mustHaves" className="block text-sm font-medium mb-2">
                  Essential Features (one per line)
                </label>
                <Textarea
                  id="mustHaves"
                  value={formData.mustHaves}
                  onChange={(event) => handleInputChange('mustHaves', event.target.value)}
                  placeholder="Feature 1&#10;Feature 2"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="notNow" className="block text-sm font-medium mb-2">
                  Out of Scope (one per line)
                </label>
                <Textarea
                  id="notNow"
                  value={formData.notNow}
                  onChange={(event) => handleInputChange('notNow', event.target.value)}
                  placeholder="Future feature 1&#10;Future feature 2"
                  rows={2}
                />
              </div>

              <div>
                <label htmlFor="constraints" className="block text-sm font-medium mb-2">
                  Constraints
                </label>
                <Textarea
                  id="constraints"
                  value={formData.constraints}
                  onChange={(event) => handleInputChange('constraints', event.target.value)}
                  placeholder="Timeline, budget, technical constraints..."
                  rows={2}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating Project...' : 'Generate Insight'}
          </Button>
        </div>
      </form>
    </div>
  );
}
