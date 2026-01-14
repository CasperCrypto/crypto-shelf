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
