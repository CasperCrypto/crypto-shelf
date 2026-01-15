import { supabase } from '../lib/supabaseClient';

export async function upsertProfileFromCurrentUser(currentUser) {
    if (!currentUser || !supabase) return;

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: currentUser.id,
            handle: currentUser.handle,
            avatar_url: currentUser.avatar,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

    if (error) {
        console.error("Error upserting profile:", error);
    }
}

export async function getProfile(userId) {
    if (!userId || !supabase) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
}

