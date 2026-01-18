-- Branding 이미지 저장용 Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 모든 사용자가 branding 버킷의 파일을 읽을 수 있도록 허용
CREATE POLICY "Public read access for branding" ON storage.objects
FOR SELECT
USING (bucket_id = 'branding');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload branding" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'branding' AND auth.role() = 'authenticated');

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete branding" ON storage.objects
FOR DELETE
USING (bucket_id = 'branding' AND auth.role() = 'authenticated');

-- 인증된 사용자만 업데이트 가능
CREATE POLICY "Authenticated users can update branding" ON storage.objects
FOR UPDATE
USING (bucket_id = 'branding' AND auth.role() = 'authenticated');
