import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LandingForm } from '@/components/landing/landing-form'

interface PageProps {
  params: Promise<{
    'branch-slug': string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: branch } = await supabase
    .from('branches')
    .select('name, landing_settings')
    .eq('slug', resolvedParams['branch-slug'])
    .eq('is_active', true)
    .single()

  if (!branch) {
    return {
      title: '페이지를 찾을 수 없습니다',
    }
  }

  // landing_settings에서 title, description 가져오기
  const settings = branch.landing_settings || {}
  const title = settings.title || '상담 신청'
  const description = settings.description || '지금 바로 상담을 신청하세요'

  return {
    title: `${title}`,
    description: description,
  }
}

export default async function LandingPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: branch, error } = await supabase
    .from('branches')
    .select('id, name, slug, description, logo_url, primary_color, landing_settings')
    .eq('slug', resolvedParams['branch-slug'])
    .eq('is_active', true)
    .single()

  if (error || !branch) {
    notFound()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${branch.primary_color}10 0%, ${branch.primary_color}05 100%)`,
      }}
    >
      <LandingForm branch={branch} />
    </div>
  )
}
