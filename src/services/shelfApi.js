import { supabase } from '../lib/supabaseClient';

export async function getShelfForUser(userId) {
    if (!userId || !supabase) return { shelf: null, items: [] };

    // 1. Get Shelf
    const { data: shelfData, error: shelfError } = await supabase
        .from('shelves')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

    if (shelfError || !shelfData) {
        // Not found or error
        return { shelf: null, items: [] };
    }

    // 2. Get Items
    const { data: itemsData, error: itemsError } = await supabase
        .from('shelf_items')
        .select('*')
        .eq('shelf_id', shelfData.id)
        .order('slot_index', { ascending: true });

    if (itemsError) {
        console.error("Error fetching shelf items:", itemsError);
        return { shelf: shelfData, items: [] };
    }

    return { shelf: shelfData, items: itemsData || [] };
}

export async function saveShelfForUser(userId, { themeId, slots }) {
    if (!userId || !supabase) return;

    // 1. Upsert Shelf
    const { data: shelfData, error: shelfError } = await supabase
        .from('shelves')
        .upsert({
            user_id: userId,
            theme_id: themeId,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }) // Assuming one shelf per user, strictly enforcing uniqueness on user_id might vary by schema but typical for "My Shelf"
        .select()
        .maybeSingle();

    if (shelfError || !shelfData) {
        console.error("Error saving shelf:", shelfError);
        return;
    }

    // 2. Prepare Items
    const itemsPayload = slots.map(slot => ({
        shelf_id: shelfData.id,
        slot_index: slot.index,
        item_key: slot.itemId, // Assuming itemId is the accessory identifier string
        extra_data: null // Add logic here if slots contain extra data (like photo frames)
    }));

    // 3. Upsert Items
    // managing items: simplest strategy is upsert by (shelf_id, slot_index)
    // if a slot is cleared (itemId is null), we still upsert it as null? 
    // Or do we delete? The prompt implies upserting the payload.
    // If the schema allows null item_key, that's fine. If not, we might need to filter.
    // Let's assume we upsert all 8 slots.

    // Check if we need to filter out nulls or if DB allows. 
    // Assuming we want to persist "empty" slots if they were cleared.
    // But typically we just store active items. 
    // Prompt says: "upsert this array into shelf_items with onConflict: shelf_id,slot_index"

    const { error: itemsError } = await supabase
        .from('shelf_items')
        .upsert(itemsPayload, { onConflict: 'shelf_id,slot_index' });

    if (itemsError) {
        console.error("Error saving shelf items:", itemsError);
    }
}

export async function getAllShelves() {
    if (!supabase) return [];

    // Fetch shelves with user profile and items
    // precise join syntax depends on foreign key names, assuming implied relation
    const { data, error } = await supabase
        .from('shelves')
        .select(`
            *,
            profiles:user_id ( handle, avatar_url, twitter_handle, is_verified ),
            items:shelf_items ( * )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching all shelves:", error);
        return [];
    }

    // Map to App format
    return data.map(shelf => ({
        id: shelf.id,
        userId: shelf.user_id,
        themeId: shelf.theme_id || 'dawn',
        slots: Array.from({ length: 8 }).map((_, i) => {
            const item = shelf.items.find(item => item.slot_index === i);
            return { index: i, itemId: item ? item.item_key : null };
        }),
        user: {
            handle: shelf.profiles?.handle || 'Unknown',
            avatar: shelf.profiles?.avatar_url || null,
            twitterHandle: shelf.profiles?.twitter_handle || null,
            isVerified: shelf.profiles?.is_verified || false
        },
        reactions: {} // TODO: implement DB reactions later
    }));
}
