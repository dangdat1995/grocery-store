-- Notifications system for customers
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info', -- order, promo, event, system, info
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- optional link to navigate to
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false, -- true = show to all customers
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_global ON notifications(is_global, created_at DESC) WHERE is_global = true;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications + global ones
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id OR is_global = true
  );

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role / admin can insert
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Service role / admin can delete
CREATE POLICY "Service can delete notifications" ON notifications
  FOR DELETE USING (true);
