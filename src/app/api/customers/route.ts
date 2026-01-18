import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

// Validation schema for customer creation
const createCustomerSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  branchId: z.string().uuid('Invalid branch ID'),
  name: z.string().optional(),
  source: z.string().optional(),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { phone, branchId, name, source, utmSource, utmMedium, utmCampaign } = validation.data

    // Clean phone number (keep only digits)
    const cleanPhone = phone.replace(/\D/g, '')

    // Validate Korean phone number format
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify branch exists and is active
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('id')
      .eq('id', branchId)
      .eq('is_active', true)
      .single()

    if (branchError || !branch) {
      return NextResponse.json(
        { error: '유효하지 않은 접수처입니다' },
        { status: 400 }
      )
    }

    // Check for existing customer with same phone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', cleanPhone)
      .single()

    // Create new customer
    const { data: customer, error: insertError } = await supabase
      .from('customers')
      .insert({
        phone: cleanPhone,
        name: name || null,
        branch_id: branchId,
        source: source || 'landing',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        is_duplicate: !!existingCustomer,
        status: 'new',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Customer creation error:', insertError)
      return NextResponse.json(
        { error: '고객 등록 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        isDuplicate: customer.is_duplicate,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET endpoint for authenticated users to fetch customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const statuses = searchParams.get('statuses')
    const categories = searchParams.get('categories')
    const branchId = searchParams.get('branchId')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const isDuplicate = searchParams.get('isDuplicate')
    const hasLicense = searchParams.get('hasLicense')
    const hasInsurance = searchParams.get('hasInsurance')
    const hasCreditCard = searchParams.get('hasCreditCard')

    const supabase = createAdminClient()
    const offset = (page - 1) * limit

    let query = supabase
      .from('customers')
      .select('*, branch:branches(id, name), assigned_user:users!customers_assigned_to_fkey(id, name)', { count: 'exact' })

    // Apply filters
    if (statuses) {
      const statusArray = statuses.split(',').filter(Boolean)
      if (statusArray.length > 0) {
        query = query.in('status', statusArray)
      }
    } else if (status) {
      query = query.eq('status', status)
    }
    if (categories) {
      const categoryArray = categories.split(',').filter(Boolean)
      if (categoryArray.length > 0) {
        query = query.in('category', categoryArray)
      }
    }
    if (branchId) {
      query = query.eq('branch_id', branchId)
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (search) {
      query = query.or(`phone.ilike.%${search}%,name.ilike.%${search}%,address.ilike.%${search}%`)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }
    if (isDuplicate !== null && isDuplicate !== undefined) {
      query = query.eq('is_duplicate', isDuplicate === 'true')
    }
    if (hasLicense !== null && hasLicense !== undefined) {
      query = query.eq('has_license', hasLicense === 'true')
    }
    if (hasInsurance !== null && hasInsurance !== undefined) {
      query = query.eq('has_insurance', hasInsurance === 'true')
    }
    if (hasCreditCard !== null && hasCreditCard !== undefined) {
      query = query.eq('has_credit_card', hasCreditCard === 'true')
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: customers, error, count } = await query

    if (error) {
      console.error('Fetch customers error:', error)
      return NextResponse.json(
        { error: '고객 목록 조회 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
