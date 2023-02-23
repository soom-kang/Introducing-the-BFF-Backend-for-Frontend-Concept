import { createClient } from '@supabase/supabase-js';
import { ANON_KEY, PROJECT } from '$env/static/private';

const supabase = createClient(`https://${PROJECT}.supabase.co`, ANON_KEY);

export default supabase;
