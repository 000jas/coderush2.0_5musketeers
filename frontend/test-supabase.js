const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xnjgdxmcubwfsekpjkpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3ODYxNDYzODEsImV4cCI6MjEwMTcyMjM4MX0.aGmybWbF-61TUvM-7qLPOmXvl3ENWTOAeaFBXse5Fzs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('anomalies').select('*').limit(1);
  console.log("Select Error:", error);
  console.log("Select Data:", data);
  
  const { data: insData, error: insErr } = await supabase.from('anomalies').insert([{
    headline: 'Test',
    risk_level: 'critical',
    what_happened: 'Test',
    next_action: 'Test',
    precautions: ['test'],
    status: 'Detected - Awaiting Operator Action'
  }]);
  console.log("Insert Error:", insErr);
  console.log("Insert Data:", insData);
}
test();
