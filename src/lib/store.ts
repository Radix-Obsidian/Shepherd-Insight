import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
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

export interface User {
  id: string
  email: string
}

export interface OptimisticUpdate {
  id: string
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
}

interface AppState {
  // Authentication state
  user: User | null
  session: any | null

  // Draft data (local only)
  currentDraftVersionData: VersionData | null

  // Cached Supabase data (optimistic)
  projects: ProjectRecord[]
  lastSync: Date | null
  syncInProgress: boolean

  // Optimistic updates tracking
  optimisticUpdates: Map<string, OptimisticUpdate>

  // Onboarding state
  hasSeenOnboarding: boolean

  // Tour state
  tourStep: number // 0-6, or -1 if not active
  isTourActive: boolean

  // UI state
  loading: boolean
  error: string | null
  sidebarCollapsed: boolean
  authReady: boolean

  // Actions
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  toggleSidebar: () => void
  checkSession: () => Promise<void>

  // Project operations
  syncProjects: () => Promise<void>
  createProject: (name: string) => Promise<ProjectRecord>
  updateProject: (id: string, updates: Partial<ProjectRecord>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Version operations
  createVersion: (projectId: string, versionData: VersionData) => Promise<void>
  updateVersion: (versionId: string, updates: Partial<VersionData>) => Promise<void>
  deleteVersion: (versionId: string) => Promise<void>

  // Optimistic operations
  addOptimisticUpdate: (id: string, update: OptimisticUpdate) => void
  removeOptimisticUpdate: (id: string) => void
  revertOptimisticUpdate: (id: string) => void

  // Local operations
  createDraftFromIntake: (formData: IntakeFormData) => void
  
  // Phase 7: Multi-project versioning operations
  createProjectFromIntake: (formData: IntakeFormData) => { projectId: string; versionId: string }
  cloneVersion: (projectId: string, versionId: string) => { newVersionId: string }
  getProjectVersion: (projectId: string, versionId: string) => any | undefined
  
  dismissOnboarding: () => void
  startTour: () => void
  nextTourStep: () => void
  skipTour: () => void
  completeTour: () => void
}

// Selectors
export const useProjects = () => useAppStore((state) => state.projects)
export const useUser = () => useAppStore((state) => state.user)
export const useSession = () => useAppStore((state) => state.session)
export const useIsAuthenticated = () => useAppStore((state) => !!state.user)
export const useLoading = () => useAppStore((state) => state.loading)
export const useError = () => useAppStore((state) => state.error)
export const useSyncInProgress = () => useAppStore((state) => state.syncInProgress)
export const useLastSync = () => useAppStore((state) => state.lastSync)
export const useOptimisticUpdates = () => useAppStore((state) => state.optimisticUpdates)

export const useHasSeenOnboarding = () => useAppStore((state) => state.hasSeenOnboarding)
export const useTourStep = () => useAppStore((state) => state.tourStep)
export const useIsTourActive = () => useAppStore((state) => state.isTourActive)
export const useDraftVersionData = () => useAppStore((state) => state.currentDraftVersionData)
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed)
export const useAuthReady = () => useAppStore((state) => state.authReady)

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => {
      // Initialize auth state from localStorage if available
      const initializeAuth = () => {
        if (typeof window !== 'undefined') {
          const storedAuth = localStorage.getItem('auth_state')
          if (storedAuth) {
            try {
              const parsedAuth = JSON.parse(storedAuth)
              return {
                user: parsedAuth.user,
                session: parsedAuth.session,
                authReady: parsedAuth.authReady || false
              }
            } catch (error) {
              console.warn('Failed to parse stored auth state:', error)
              localStorage.removeItem('auth_state')
            }
          }
        }
        return { user: null, session: null, authReady: false }
      }

      const initialAuth = initializeAuth()

      return {
        // Initial state
        user: initialAuth.user,
        session: initialAuth.session,
        authReady: initialAuth.authReady,
        currentDraftVersionData: null,
        projects: [],
        lastSync: null,
        syncInProgress: false,
        optimisticUpdates: new Map(),
        hasSeenOnboarding: false,
        tourStep: -1,
        isTourActive: false,
        loading: false,
        error: null,
        sidebarCollapsed: false,

        // Auth actions
      setUser: (user: User | null) => set({ user }),
      setSession: (session: any | null) => set({ session }),

      // UI actions
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      toggleSidebar: () => {
        const current = get().sidebarCollapsed
        const newState = !current
        set({ sidebarCollapsed: newState })
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
        }
      },

      checkSession: async () => {
        try {
          set({ authReady: false })
          
          // Create browser client for client-side auth
          const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser')
          const supabase = createSupabaseBrowserClient()
          
          // Get session from Supabase (checks localStorage automatically)
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Session check error:', error)
            set({ user: null, session: null, authReady: true })
            return
          }
          
          if (session?.user) {
            const authState = {
              user: { id: session.user.id, email: session.user.email || '' },
              session: session,
              authReady: true
            }
            set(authState)
            
            // Set up auth state change listener
            supabase.auth.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_OUT') {
                set({ user: null, session: null, authReady: true })
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth_state')
                }
              } else if (session) {
                const newAuthState = {
                  user: { id: session.user.id, email: session.user.email || '' },
                  session: session,
                  authReady: true
                }
                set(newAuthState)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('auth_state', JSON.stringify(newAuthState))
                }
              }
            })
          } else {
            set({ user: null, session: null, authReady: true })
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_state')
            }
          }
        } catch (error) {
          console.error('Check session failed:', error)
          set({ user: null, session: null, authReady: true })
        }
      },

      // Project operations with optimistic updates
      syncProjects: async () => {
        set({ syncInProgress: true, error: null })
        try {
          const response = await fetch('/api/supabase?action=projects')
          if (!response.ok) {
            throw new Error('Failed to sync projects')
          }
          const data = await response.json()
          set({
            projects: data.projects || [],
            lastSync: new Date(),
            syncInProgress: false
          })
        } catch (error: any) {
          set({
            error: `Failed to sync projects: ${error.message}`,
            syncInProgress: false
          })
        }
      },

      createProject: async (name: string) => {
        const optimisticId = `temp-${Date.now()}`
        const now = new Date().toISOString()
        const optimisticProject: ProjectRecord = {
          id: optimisticId,
          name,
          created_at: now,
          updated_at: now,
          versions: []
        }

        // Optimistic update
        set((state) => ({
          projects: [optimisticProject, ...state.projects],
          optimisticUpdates: new Map(state.optimisticUpdates).set(optimisticId, {
            id: optimisticId,
            type: 'create',
            data: optimisticProject,
            timestamp: new Date()
          })
        }))

        try {
          const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create-project', name })
          })

          if (!response.ok) {
            throw new Error('Failed to create project')
          }

          const data = await response.json()
          const realProject = data.project

          // Replace optimistic with real data
          set((state) => {
            const newUpdates = new Map(state.optimisticUpdates)
            newUpdates.delete(optimisticId)
            return {
              projects: state.projects.map(p =>
                p.id === optimisticId ? realProject : p
              ),
              optimisticUpdates: newUpdates
            }
          })

          return realProject
        } catch (error: any) {
          // Revert optimistic update
          set((state) => {
            const newUpdates = new Map(state.optimisticUpdates)
            newUpdates.delete(optimisticId)
            return {
              projects: state.projects.filter(p => p.id !== optimisticId),
              optimisticUpdates: newUpdates,
              error: `Failed to create project: ${error.message}`
            }
          })
          throw error
        }
      },

      updateProject: async (id: string, updates: Partial<ProjectRecord>) => {
        // Optimistic update
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
          optimisticUpdates: new Map(state.optimisticUpdates).set(id, {
            id,
            type: 'update',
            data: updates,
            timestamp: new Date()
          })
        }))

        try {
          const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-project', id, updates })
          })

          if (!response.ok) {
            throw new Error('Failed to update project')
          }

          // Remove optimistic update on success
          set((state) => {
            const newUpdates = new Map(state.optimisticUpdates)
            newUpdates.delete(id)
            return { optimisticUpdates: newUpdates }
          })
        } catch (error: any) {
          // Revert optimistic update
          set((state) => {
            const newUpdates = new Map(state.optimisticUpdates)
            newUpdates.delete(id)
            return {
              projects: state.projects.map(p =>
                p.id === id ? { ...p, ...updates } : p
              ),
              optimisticUpdates: newUpdates,
              error: `Failed to update project: ${error.message}`
            }
          })
          throw error
        }
      },

      deleteProject: async (id: string) => {
        const projectToDelete = get().projects.find(p => p.id === id)

        // Optimistic update
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          optimisticUpdates: new Map(state.optimisticUpdates).set(id, {
            id,
            type: 'delete',
            data: projectToDelete,
            timestamp: new Date()
          })
        }))

        try {
          const response = await fetch(`/api/supabase?action=delete&id=${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete project')
          }

          // Remove optimistic update on success
          set((state) => {
            const newUpdates = new Map(state.optimisticUpdates)
            newUpdates.delete(id)
            return { optimisticUpdates: newUpdates }
          })
        } catch (error: any) {
          // Revert optimistic update
          set((state) => {
            const newUpdates = new Map(state.optimisticUpdates)
            newUpdates.delete(id)
            if (projectToDelete) {
              return {
                projects: [...state.projects, projectToDelete],
                optimisticUpdates: newUpdates,
                error: `Failed to delete project: ${error.message}`
              }
            }
            return { optimisticUpdates: newUpdates }
          })
          throw error
        }
      },

      // Version operations
      createVersion: async (projectId: string, versionData: VersionData) => {
        try {
          const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create-version',
              projectId,
              versionData
            })
          })

          if (!response.ok) {
            throw new Error('Failed to create version')
          }

          // Refresh projects to get updated version data
          await get().syncProjects()
        } catch (error: any) {
          set({ error: `Failed to create version: ${error.message}` })
          throw error
        }
      },

      updateVersion: async (versionId: string, updates: Partial<VersionData>) => {
        try {
          const response = await fetch('/api/supabase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update-version',
              versionId,
              updates
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update version')
          }

          // Refresh projects to get updated version data
          await get().syncProjects()
        } catch (error: any) {
          set({ error: `Failed to update version: ${error.message}` })
          throw error
        }
      },

      deleteVersion: async (versionId: string) => {
        try {
          const response = await fetch(`/api/supabase?action=delete-version&id=${versionId}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete version')
          }

          // Refresh projects to get updated version data
          await get().syncProjects()
        } catch (error: any) {
          set({ error: `Failed to delete version: ${error.message}` })
          throw error
        }
      },

      // Optimistic operations
      addOptimisticUpdate: (id: string, update: OptimisticUpdate) => {
        set((state) => ({
          optimisticUpdates: new Map(state.optimisticUpdates).set(id, update)
        }))
      },

      removeOptimisticUpdate: (id: string) => {
        set((state) => {
          const newUpdates = new Map(state.optimisticUpdates)
          newUpdates.delete(id)
          return { optimisticUpdates: newUpdates }
        })
      },

      revertOptimisticUpdate: (id: string) => {
        const update = get().optimisticUpdates.get(id)
        if (!update) return

        set((state) => {
          const newUpdates = new Map(state.optimisticUpdates)
          newUpdates.delete(id)

          let newProjects = state.projects

          switch (update.type) {
            case 'create':
              newProjects = state.projects.filter(p => p.id !== id)
              break
            case 'delete':
              if (update.data) {
                newProjects = [...state.projects, update.data]
              }
              break
            case 'update':
              newProjects = state.projects.map(p =>
                p.id === id ? { ...p, ...update.data } : p
              )
              break
          }

          return { projects: newProjects, optimisticUpdates: newUpdates }
        })
      },

      // Local operations
      createDraftFromIntake: (formData: IntakeFormData) => {
        const versionData: VersionData = {
          name: formData.productName,
          audience: formData.audience,
          problem: formData.problem,
          why_current_fails: formData.whyCurrentFails,
          promise: formData.promise,
          must_haves: formData.mustHaves.split('\n').filter(Boolean),
          not_now: formData.notNow.split('\n').filter(Boolean),
          constraints: formData.constraints,
        }

        set({ currentDraftVersionData: versionData })
      },

      // Phase 7: Multi-project versioning operations
      createProjectFromIntake: (formData: IntakeFormData) => {
        const projectId = `project-${Date.now()}`
        const versionId = `version-${Date.now()}`
        const now = new Date().toISOString()
        
        const versionData: VersionData = {
          name: formData.productName,
          audience: formData.audience,
          problem: formData.problem,
          why_current_fails: formData.whyCurrentFails,
          promise: formData.promise,
          must_haves: formData.mustHaves.split('\n').filter(Boolean),
          not_now: formData.notNow.split('\n').filter(Boolean),
          constraints: formData.constraints,
        }

        const version = {
          id: versionId,
          version_number: 1,
          ...versionData,
          locked_decisions: {
            mustHavesLocked: [],
            notNowLocked: []
          },
          created_at: now,
          updated_at: now
        }

        const newProject: ProjectRecord = {
          id: projectId,
          name: formData.productName,
          created_at: now,
          updated_at: now,
          versions: [version]
        }

        set((state) => ({
          projects: [newProject, ...state.projects],
          currentDraftVersionData: versionData
        }))

        return { projectId, versionId }
      },

      cloneVersion: (projectId: string, versionId: string) => {
        const newVersionId = `version-${Date.now()}`
        const now = new Date().toISOString()
        
        set((state) => {
          const project = state.projects.find(p => p.id === projectId)
          if (!project) {
            throw new Error(`Project ${projectId} not found`)
          }

          const sourceVersion = project.versions.find(v => v.id === versionId)
          if (!sourceVersion) {
            throw new Error(`Version ${versionId} not found`)
          }

          const newVersionNumber = Math.max(...project.versions.map(v => v.version_number)) + 1
          
          const clonedVersion = {
            ...sourceVersion,
            id: newVersionId,
            version_number: newVersionNumber,
            created_at: now,
            updated_at: now
          }

          const updatedProjects = state.projects.map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                versions: [...p.versions, clonedVersion],
                updated_at: now
              }
            }
            return p
          })

          return { projects: updatedProjects }
        })

        return { newVersionId }
      },

      getProjectVersion: (projectId: string, versionId: string) => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)
        if (!project) return undefined
        
        const version = project.versions.find(v => v.id === versionId)
        return version
      },

      // Tour operations
      dismissOnboarding: () => set({ hasSeenOnboarding: true }),
      startTour: () => set({ tourStep: 0, isTourActive: true }),
      nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
      skipTour: () => set({ hasSeenOnboarding: true, isTourActive: false, tourStep: -1 }),
      completeTour: () => set({ hasSeenOnboarding: true, isTourActive: false, tourStep: -1 }),
    }
  },
  {
    name: 'app-store',
  }
  )
)

// Initialize sidebar state from localStorage
if (typeof window !== 'undefined') {
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState !== null) {
    useAppStore.setState({ sidebarCollapsed: JSON.parse(savedSidebarState) })
  }
  
  // Initialize auth check on mount, only if not already authenticated from storage
  const { user } = useAppStore.getState()
  if (!user) {
    useAppStore.getState().checkSession()
  } else {
    // If user is already in the store, we can assume auth is ready
    useAppStore.setState({ authReady: true })
  }
}