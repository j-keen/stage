import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const memoSchema = z.object({
  memo: z.string().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = memoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { memo } = validation.data
    const supabase = createAdminClient()

    // Verify team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingTeam) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Update team memo
    const { error: updateError } = await supabase
      .from('teams')
      .update({ memo })
      .eq('id', id)

    if (updateError) {
      console.error('Memo update error:', updateError)
      return NextResponse.json(
        { error: '메모 업데이트 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    )
  }
}
