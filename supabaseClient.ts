import { createClient } from '@supabase/supabase-js';

// Expo web/client code only exposes env vars prefixed with EXPO_PUBLIC_
const supabaseUrl =
	(process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ??
	(process.env.SUPABASE_URL as string | undefined);

const supabaseAnonKey =
	(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ??
	(process.env.SUPABASE_ANON_KEY as string | undefined);

if (!supabaseUrl) {
	throw new Error(
		'Missing Supabase URL. Add EXPO_PUBLIC_SUPABASE_URL to your .env (or SUPABASE_URL as a fallback).'
	);
}

if (!supabaseAnonKey) {
	throw new Error(
		'Missing Supabase anon key. Add EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env (or SUPABASE_ANON_KEY as a fallback).'
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
