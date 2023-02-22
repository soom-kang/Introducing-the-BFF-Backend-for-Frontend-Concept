import supabase from '$lib/db';

const country = await supabase.rpc('get_country').eq('id', 18);

export default country;
