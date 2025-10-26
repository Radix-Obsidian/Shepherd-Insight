import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'projects': {
        const { data: projects, error } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            created_at,
            versions (
              id,
              version_number,
              name,
              created_at,
              locked_decisions
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ projects })
      }

      case 'project': {
        const projectId = searchParams.get('projectId')
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }

        const { data: project, error } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            created_at,
            versions (
              id,
              version_number,
              name,
              audience,
              problem,
              why_current_fails,
              promise,
              must_haves,
              not_now,
              constraints,
              locked_decisions,
              created_at
            )
          `)
          .eq('id', projectId)
          .single()

        if (error) throw error

        return NextResponse.json({ project })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Supabase GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create-project': {
        const { name } = data
        if (!name) {
          return NextResponse.json({ error: 'Project name required' }, { status: 400 })
        }

        const { data: project, error } = await supabase
          .from('projects')
          .insert([{ name }])
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ project })
      }

      case 'create-version': {
        const { projectId, versionData } = data
        if (!projectId || !versionData) {
          return NextResponse.json({ error: 'Project ID and version data required' }, { status: 400 })
        }

        // Get the next version number
        const { data: versions, error: versionError } = await supabase
          .from('versions')
          .select('version_number')
          .eq('project_id', projectId)
          .order('version_number', { ascending: false })
          .limit(1)

        if (versionError) throw versionError

        const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1

        const { data: version, error } = await supabase
          .from('versions')
          .insert([{
            project_id: projectId,
            version_number: nextVersionNumber,
            ...versionData
          }])
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ version })
      }

      case 'update-version': {
        const { versionId, updates } = data
        if (!versionId || !updates) {
          return NextResponse.json({ error: 'Version ID and updates required' }, { status: 400 })
        }

        const { data: version, error } = await supabase
          .from('versions')
          .update(updates)
          .eq('id', versionId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ version })
      }

      case 'update-project': {
        const { id, updates } = data
        if (!id || !updates) {
          return NextResponse.json({ error: 'Project ID and updates required' }, { status: 400 })
        }

        const { data: project, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ project })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Supabase POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    switch (action) {
      case 'project': {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
      }

      case 'version':
      case 'delete-version': {
        const { error } = await supabase
          .from('versions')
          .delete()
          .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Supabase DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
