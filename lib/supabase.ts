import { createClient } from '@supabase/supabase-js'; // Mengimpor fungsi createClient dari @supabase/supabase-js

export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
