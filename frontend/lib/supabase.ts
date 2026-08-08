import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xnjgdxmcubwfsekpjkpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuamdkeG1jdWJ3ZnNla3Bqa3BtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE0NjM4MSwiZXhwIjoyMTAxNzIyMzgxfQ.aGmybWbF-61TUvM-7qLPOmXvl3ENWTOAeaFBXse5Fzs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
