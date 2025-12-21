-- =============================================
-- RBAC MIGRATION - ADD ROLE-BASED ACCESS CONTROL
-- Run this ONLY (don't run the main schema again)
-- =============================================

-- Step 1: Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Step 5: Add updated_at trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Drop old RLS policies (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Only admins can manage profiles" ON user_profiles;

-- Step 7: Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can manage profiles"
ON user_profiles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Step 8: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPDATE EXISTING RLS POLICIES FOR ROLE-BASED ACCESS
-- =============================================

-- PROPERTIES TABLE
DROP POLICY IF EXISTS "Allow public read access to properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated insert on properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated update on properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated delete on properties" ON properties;

CREATE POLICY "Anyone can view properties"
ON properties FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update properties"
ON properties FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete properties"
ON properties FOR DELETE
TO authenticated
USING (is_admin());

-- RESIDENTS TABLE
DROP POLICY IF EXISTS "Allow public read access to residents" ON residents;
DROP POLICY IF EXISTS "Allow authenticated insert on residents" ON residents;
DROP POLICY IF EXISTS "Allow authenticated update on residents" ON residents;
DROP POLICY IF EXISTS "Allow authenticated delete on residents" ON residents;

CREATE POLICY "Anyone can view residents"
ON residents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert residents"
ON residents FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update residents"
ON residents FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete residents"
ON residents FOR DELETE
TO authenticated
USING (is_admin());

-- DISBURSEMENTS TABLE
DROP POLICY IF EXISTS "Allow public read access to disbursements" ON disbursements;
DROP POLICY IF EXISTS "Allow authenticated insert on disbursements" ON disbursements;
DROP POLICY IF EXISTS "Allow authenticated update on disbursements" ON disbursements;
DROP POLICY IF EXISTS "Allow authenticated delete on disbursements" ON disbursements;

CREATE POLICY "Anyone can view disbursements"
ON disbursements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert disbursements"
ON disbursements FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update disbursements"
ON disbursements FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete disbursements"
ON disbursements FOR DELETE
TO authenticated
USING (is_admin());

-- REPAYMENTS TABLE
DROP POLICY IF EXISTS "Allow public read access to repayments" ON repayments;
DROP POLICY IF EXISTS "Allow authenticated insert on repayments" ON repayments;
DROP POLICY IF EXISTS "Allow authenticated update on repayments" ON repayments;
DROP POLICY IF EXISTS "Allow authenticated delete on repayments" ON repayments;

CREATE POLICY "Anyone can view repayments"
ON repayments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert repayments"
ON repayments FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update repayments"
ON repayments FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete repayments"
ON repayments FOR DELETE
TO authenticated
USING (is_admin());

-- =============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'viewer')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON user_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ RBAC Migration completed successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Sign up in your app';
    RAISE NOTICE '   2. Run: UPDATE user_profiles SET role = ''admin'' WHERE email = ''your-email@example.com'';';
    RAISE NOTICE '   3. Log out and log back in';
END $$;
