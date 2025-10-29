// Initialize Supabase Client
const SUPABASE_URL = 'https://rcfholklsnlwucooxwmf.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZmhvbGtsc25sd3Vjb294d21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Mjg5NTksImV4cCI6MjA3NzMwNDk1OX0.ocwS8VoPZ7IT7eEUqCLaa_JV4GK27s3wKbEgzyJUu5k'; // Replace with your anon key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
