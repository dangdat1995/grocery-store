-- Payment webhook logs
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'sepay', -- sepay, casso, etc
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- success, amount_mismatch, error
  amount BIGINT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT, -- order_confirmation, payment_received, etc
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, failed
  resend_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_address TEXT,
  buyer_tax_code TEXT,
  subtotal BIGINT NOT NULL DEFAULT 0,
  delivery_fee BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  tax_amount BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL DEFAULT 0,
  note TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add payment_reference to orders for webhook matching
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Supabase Storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read
CREATE POLICY "Public can read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Admin can upload/delete
CREATE POLICY "Admin can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS for new tables
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admin can view all
CREATE POLICY "Admin can manage payment_webhooks" ON payment_webhooks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage email_logs" ON email_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );
