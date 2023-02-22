import supabase from '$lib/db';

const countries = await supabase.from('countries').select();

export default countries;
