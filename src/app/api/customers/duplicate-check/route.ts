import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const duplicateCheckSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  branchId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = duplicateCheckSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { phone } = validation.data

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '')

    // Validate phone format
    if (cleanPhone.length !== 11) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check for existing customer
    const { data: existingCustomer, error } = await supabase
      .from('customers')
      .select('id, created_at, status')
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Duplicate check error:', error)
      return NextResponse.json(
        { error: '중복 확인 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isDuplicate: !!existingCustomer,
      existingCustomer: existingCustomer
        ? {
            id: existingCustomer.id,
            status: existingCustomer.status,
            createdAt: existingCustomer.created_at,
          }
        : null,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
