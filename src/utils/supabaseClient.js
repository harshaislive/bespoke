import { createClient } from '@supabase/supabase-js';

// PLACEHOLDER CONFIG - Replace with your actual Supabase credentials
// These placeholder values are formatted correctly to prevent initialization errors
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key-for-development-only';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export for use in other files
export default supabase; 