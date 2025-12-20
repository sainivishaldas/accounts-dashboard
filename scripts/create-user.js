import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gywcmiqwjcmfajafwgbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5d2NtaXF3amNtZmFqYWZ3Z2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDMwNzUsImV4cCI6MjA4MTc3OTA3NX0.px06uaGSEdyWxCaaGykNMrZLp4yVcsEPxBW9wLB9_FA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test credentials
const TEST_EMAIL = 'admin@accountsdashboard.com';
const TEST_PASSWORD = 'test123456';

async function createTestUser() {
  console.log('Creating test user...');
  console.log('Email:', TEST_EMAIL);
  console.log('Password:', TEST_PASSWORD);
  
  const { data, error } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }

  console.log('User created successfully!');
  console.log('User ID:', data.user?.id);
  console.log('\n--- Test Credentials ---');
  console.log('Email: test@example.com');
  console.log('Password: test123456');
}

createTestUser();
