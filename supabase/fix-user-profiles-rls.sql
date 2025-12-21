-- =============================================
-- FIX: User Profiles RLS Infinite Recursion
-- =============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Only admins can manage profiles" ON user_profiles;

-- Create simplified policies that don't cause recursion
-- Policy 1: All authenticated users can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: All authenticated users can read all profiles
-- (This is needed because we query user_profiles to check roles)
CREATE POLICY "All users can read all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Users cannot update profiles (only through SQL/admin)
-- We'll allow updates via SQL only for now to avoid complexity
-- If you want users to update profiles, you'll need a service role

-- Note: Admins can still manage profiles directly via SQL or Supabase dashboard
