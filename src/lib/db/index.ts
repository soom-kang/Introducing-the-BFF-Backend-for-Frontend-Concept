import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	'https://ionfxhbvkhryqlggjcoj.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmZ4aGJ2a2hyeXFsZ2dqY29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA4MzYzNTgsImV4cCI6MTk4NjQxMjM1OH0.P453OaY1kZuzC-ABoxsn8LS_D3GtVIUn3mWo6hS1TAI'
);

export default supabase;
