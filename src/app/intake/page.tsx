'use client';

/**
 * Legacy Intake Page - DEPRECATED
 * 
 * Redirects to Compass (the new starting point for the Shepherd Journey)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function IntakePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/compass');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Redirecting to Shepherd Compass...</p>
      </div>
    </div>
  );
}

// Legacy code removed - Intake functionality replaced by Compass
// Original file preserved in git history for reference
