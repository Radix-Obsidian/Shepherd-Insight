import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { VersionData, ProjectRecord } from '@/types/project'

export interface IntakeFormData {
  productName: string
  audience: string
  problem: string
  whyCurrentFails: string
  promise: string
  mustHaves: string
  notNow: string
  constraints: string
}

interface AppState {
  // Draft data
  currentDraftVersionData: VersionData | null

  // Projects (for now, empty array - will be populated later)
  projects: ProjectRecord[]

  // Onboarding state
  hasSeenOnboarding: boolean

  // Tour state
  tourStep: number // 0-6, or -1 if not active
  isTourActive: boolean

  // UI state
  loading: boolean

  // Actions
  setLoading: (loading: boolean) => void
  createDraftFromIntake: (formData: IntakeFormData) => void
  dismissOnboarding: () => void
  startTour: () => void
  nextTourStep: () => void
  skipTour: () => void
  completeTour: () => void
}

// Selectors
export const useProjects = () => useAppStore((state) => state.projects)
export const useHasSeenOnboarding = () => useAppStore((state) => state.hasSeenOnboarding)
export const useTourStep = () => useAppStore((state) => state.tourStep)
export const useIsTourActive = () => useAppStore((state) => state.isTourActive)

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      currentDraftVersionData: null,
      projects: [], // Start with empty projects array
      hasSeenOnboarding: false, // Default to false for onboarding experience
      tourStep: -1, // -1 means tour not active
      isTourActive: false,
      loading: false,
      setLoading: (loading: boolean) => set({ loading }),
      createDraftFromIntake: (formData: IntakeFormData) => {
        const versionData: VersionData = {
          name: formData.productName,
          audience: formData.audience,
          problem: formData.problem,
          whyCurrentFails: formData.whyCurrentFails,
          promise: formData.promise,
          mustHaves: formData.mustHaves.split('\n').filter(Boolean),
          notNow: formData.notNow.split('\n').filter(Boolean),
          constraints: formData.constraints,
        }

        set({ currentDraftVersionData: versionData })
      },
      dismissOnboarding: () => set({ hasSeenOnboarding: true }),
      startTour: () => set({ tourStep: 0, isTourActive: true }),
      nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
      skipTour: () => set({ hasSeenOnboarding: true, isTourActive: false, tourStep: -1 }),
      completeTour: () => set({ hasSeenOnboarding: true, isTourActive: false, tourStep: -1 }),
    }),
    {
      name: 'app-store',
    }
  )
)