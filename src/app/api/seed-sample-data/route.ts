import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CustomerStatus } from '@/types/database'

const KOREAN_SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
const KOREAN_NAMES = ['민준', '서연', '지후', '수빈', '예준', '지아', '도윤', '하은', '시우', '지유']
const STATUSES: CustomerStatus[] = ['prospect', 'in_progress', 'completed', 'callback', 'absent', 'cancelled']
const CATEGORIES = ['new_customer', 'existing', 'blacklist', 'vip']

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPhone(): string {
  return '010' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
}

function randomName(): string {
  return randomElement(KOREAN_SURNAMES) + randomElement(KOREAN_NAMES)
}

function randomDate(daysAgo: number, daysRange: number = 1): string {
  const now = new Date()
  const baseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  const randomOffset = Math.random() * daysRange * 24 * 60 * 60 * 1000
  const finalDate = new Date(baseDate.getTime() + randomOffset)
  return finalDate.toISOString()
}

interface SampleCustomer {
  phone: string
  name: string
  status: CustomerStatus
  category: string
  branch_id: string
  created_at: string
  updated_at: string
  custom_fields: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get the default branch
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('id')
      .eq('slug', 'default')
      .single()

    if (branchError || !branch) {
      return NextResponse.json(
        { error: 'Default branch not found. Please run seed.sql first.' },
        { status: 400 }
      )
    }

    const branchId = branch.id
    const customers: SampleCustomer[] = []

    // Today: 5 customers
    for (let i = 0; i < 5; i++) {
      const date = randomDate(0, 0.5) // within 12 hours
      customers.push({
        phone: randomPhone(),
        name: randomName(),
        status: randomElement(STATUSES),
        category: randomElement(CATEGORIES),
        branch_id: branchId,
        created_at: date,
        updated_at: date,
        custom_fields: {},
      })
    }

    // Yesterday: 8 customers
    for (let i = 0; i < 8; i++) {
      const date = randomDate(1, 0.5)
      customers.push({
        phone: randomPhone(),
        name: randomName(),
        status: randomElement(STATUSES),
        category: randomElement(CATEGORIES),
        branch_id: branchId,
        created_at: date,
        updated_at: date,
        custom_fields: {},
      })
    }

    // Last 7 days (excluding today and yesterday): 12 customers
    for (let i = 0; i < 12; i++) {
      const daysAgo = 2 + Math.floor(Math.random() * 5) // 2-6 days ago
      const date = randomDate(daysAgo, 0.5)
      customers.push({
        phone: randomPhone(),
        name: randomName(),
        status: randomElement(STATUSES),
        category: randomElement(CATEGORIES),
        branch_id: branchId,
        created_at: date,
        updated_at: date,
        custom_fields: {},
      })
    }

    // This month (7-28 days ago): 20 customers
    for (let i = 0; i < 20; i++) {
      const daysAgo = 7 + Math.floor(Math.random() * 21) // 7-27 days ago
      const date = randomDate(daysAgo, 0.5)
      customers.push({
        phone: randomPhone(),
        name: randomName(),
        status: randomElement(STATUSES),
        category: randomElement(CATEGORIES),
        branch_id: branchId,
        created_at: date,
        updated_at: date,
        custom_fields: {},
      })
    }

    // Last month: 15 customers (30-60 days ago)
    for (let i = 0; i < 15; i++) {
      const daysAgo = 30 + Math.floor(Math.random() * 30) // 30-59 days ago
      const date = randomDate(daysAgo, 0.5)
      customers.push({
        phone: randomPhone(),
        name: randomName(),
        status: randomElement(STATUSES),
        category: randomElement(CATEGORIES),
        branch_id: branchId,
        created_at: date,
        updated_at: date,
        custom_fields: {},
      })
    }

    // Insert all customers
    const { data: insertedCustomers, error: insertError } = await supabase
      .from('customers')
      .insert(customers)
      .select('id')

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert sample customers', details: insertError.message },
        { status: 500 }
      )
    }

    // Count by period for summary
    const summary = {
      today: customers.filter(c => {
        const d = new Date(c.created_at)
        const now = new Date()
        return d.toDateString() === now.toDateString()
      }).length,
      yesterday: customers.filter(c => {
        const d = new Date(c.created_at)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return d.toDateString() === yesterday.toDateString()
      }).length,
      thisWeek: customers.filter(c => {
        const d = new Date(c.created_at)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return d >= weekAgo
      }).length,
      total: customers.length,
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${customers.length} sample customers`,
      summary,
      insertedCount: insertedCustomers?.length || 0,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current data count
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to count customers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      currentCount: count || 0,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error occurred' },
      { status: 500 }
    )
  }
}
