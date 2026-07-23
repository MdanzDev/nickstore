const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldfodgqlwwxjggrhypmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZm9kaHFsd3d4amdncmh5cG1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMDQ3MCwiZXhwIjoyMTAwMzg2NDcwfQ.Y-_t0SDkrQECPBEj1fr1BreaWZsZmvrp08y_QEVfzPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Query information_schema to get tables
  const { data, error } = await supabase.from('games').select('*').limit(1);
  if (error) {
    console.error('Error fetching games:', error);
  } else {
    console.log('Games table exists, rows:', data);
  }
}

check();
