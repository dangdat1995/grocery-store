-- Staff roles & permissions system
-- Extends profiles with granular role types and branch assignments

-- Staff role: more granular than just admin/customer
-- super_admin: full access to everything
-- branch_manager: manage assigned branch(es)
-- staff: limited access based on permissions
CREATE TYPE staff_role AS ENUM ('super_admin', 'branch_manager', 'staff');

-- Staff profiles (extends existing profiles table)
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_role staff_role NOT NULL DEFAULT 'staff',
  display_name TEXT,
  position TEXT,  -- e.g. 'Thu ngân', 'Kho', 'CSKH'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Branch assignments (which staff manages which branches)
CREATE TABLE IF NOT EXISTS staff_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,  -- primary branch
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, branch_id)
);

-- Granular permissions per staff member
CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  module TEXT NOT NULL,      -- 'products', 'orders', 'customers', 'inventory', 'vouchers', 'events', 'combos', 'gifts', 'branches', 'settings', 'reports'
  can_view BOOLEAN DEFAULT true,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(staff_id, module)
);

-- RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read staff" ON staff_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manage staff" ON staff_members FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin read staff_branches" ON staff_branches FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manage staff_branches" ON staff_branches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin read staff_permissions" ON staff_permissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manage staff_permissions" ON staff_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
