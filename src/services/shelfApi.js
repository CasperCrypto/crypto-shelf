import { supabase } from '../lib/supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

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

export async function saveShelfForUser(userId, { themeId, skinId, slots }) {
    if (!userId || !supabase) return;

    // 1. Upsert Shelf
    const { data: shelfData, error: shelfError } = await supabase
        .from('shelves')
        .upsert({
            user_id: userId,
            theme_id: themeId,
            skin_id: skinId,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
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

export async function getReactionsForShelf(shelfId) {
    if (!shelfId || !supabase) return [];

    const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('shelf_id', shelfId);

    if (error) {
        console.error("Error fetching reactions:", error);
        return [];
    }
    return data;
}

export async function saveReaction(shelfId, userId, type) {
    if (!shelfId || !userId || !supabase) return;

    // 1. Check for existing reaction by this user on this shelf
    const { data: existing, error: fetchError } = await supabase
        .from('reactions')
        .select('id, type')
        .eq('shelf_id', shelfId)
        .eq('user_id', userId)
        .maybeSingle();

    if (fetchError) {
        console.error("Error checking existing reaction:", fetchError);
        return;
    }

    if (existing) {
        // 2. If same type, remove it (toggle off)
        if (existing.type === type) {
            const { error: deleteError } = await supabase
                .from('reactions')
                .delete()
                .eq('id', existing.id);
            if (deleteError) console.error("Error toggling off reaction:", deleteError);
        } else {
            // 3. If different type, update it (change reaction)
            const { error: updateError } = await supabase
                .from('reactions')
                .update({ type: type })
                .eq('id', existing.id);
            if (updateError) console.error("Error updating reaction:", updateError);
        }
    } else {
        // 4. If no reaction, insert new one
        const { error: insertError } = await supabase
            .from('reactions')
            .insert({
                shelf_id: shelfId,
                user_id: userId,
                type: type
            });
        if (insertError) console.error("Error saving reaction:", insertError);
    }
}



export async function getAllShelves() {
    if (!supabase) return [];

    // 1. Fetch shelves with profiles and items
    const { data: shelfData, error: shelfError } = await supabase
        .from('shelves')
        .select(`
            *,
            profiles:user_id!inner ( handle, avatar_url, twitter_handle, is_verified, is_hidden ),
            items:shelf_items ( * )
        `)
        .eq('profiles.is_hidden', false)
        .order('created_at', { ascending: false });

    if (shelfError) {
        console.error("Error fetching all shelves:", shelfError);
        return [];
    }

    // 2. Fetch all reactions separately
    const { data: reactionData, error: reactionError } = await supabase
        .from('reactions')
        .select('shelf_id, type');

    if (reactionError) {
        console.error("Error fetching all reactions:", reactionError);
    }

    // 3. Map and Merge with reactions
    return shelfData.map(shelf => {
        // Filter reactions for this specific shelf
        const shelfReactions = (reactionData || []).filter(r => r.shelf_id === shelf.id);

        // Count reactions by type
        const reactionCounts = {};
        shelfReactions.forEach(r => {
            reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
        });

        return {
            id: shelf.id,
            userId: shelf.user_id,
            themeId: shelf.theme_id || 'dawn',
            skinId: shelf.skin_id || 'classic_wood',
            isFeatured: shelf.is_featured || false,
            slots: Array.from({ length: 8 }).map((_, i) => {
                const item = shelf.items.find(item => item.slot_index === i);
                return { index: i, itemId: item ? item.item_key : null };
            }),
            user: {
                handle: shelf.profiles?.handle || 'Unknown',
                avatar: shelf.profiles?.avatar_url || null,
                twitterHandle: shelf.profiles?.twitter_handle || null,
                isVerified: (shelf.profiles?.is_verified || !!shelf.profiles?.twitter_handle),
                isHidden: shelf.profiles?.is_hidden || false
            },
            reactions: reactionCounts,
            totalReactions: shelfReactions.length
        };
    });
}

export async function updateShelfStatus(shelfId, updates) {
    if (!supabase || !shelfId) return;

    // updates could be { is_featured: true }
    const { error } = await supabase
        .from('shelves')
        .update(updates)
        .eq('id', shelfId);

    if (error) {
        console.error("Error updating shelf status:", error);
    }
}

export async function getShelfById(shelfId) {
    if (!shelfId || !supabase) return null;

    const { data, error } = await supabase
        .from('shelves')
        .select(`
            *,
            profiles:user_id ( handle, avatar_url, twitter_handle, is_verified ),
            items:shelf_items ( * )
        `)
        .eq('id', shelfId)
        .maybeSingle();

    if (error || !data) {
        console.error("Error fetching shelf by id:", error);
        return null;
    }

    return {
        id: data.id,
        userId: data.user_id,
        themeId: data.theme_id || 'dawn',
        skinId: data.skin_id || 'classic_wood',
        slots: Array.from({ length: 8 }).map((_, i) => {
            const item = data.items.find(item => item.slot_index === i);
            return { index: i, itemId: item ? item.item_key : null };
        }),

        user: {
            handle: data.profiles?.handle || 'Unknown',
            avatar: data.profiles?.avatar_url || null,
            twitterHandle: data.profiles?.twitter_handle || null,
            isVerified: (data.profiles?.is_verified || !!data.profiles?.twitter_handle)
        }
    };
}

export async function getAccessories() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

    if (error) {
        console.error("Error fetching accessories:", error);
        return [];
    }

    // Map database columns to expected format
    return (data || []).map(acc => {
        let img = acc.image || acc.image_url || acc.image_path || '';

        // Resolve Supabase path if needed
        if (img && !img.startsWith('http') && !img.startsWith('/') && !img.startsWith('assets/')) {
            if (supabaseUrl) {
                img = `${supabaseUrl}/storage/v1/object/public/assets/${img}`;
            }
        } else if (img && img.startsWith('accessories/')) {
            if (supabaseUrl) {
                img = `${supabaseUrl}/storage/v1/object/public/assets/${img}`;
            }
        }

        return {
            id: acc.id,
            name: acc.name,
            category: acc.category,
            rarity: acc.rarity,
            image: img,
            image_url: img,
            image_path: acc.image_path || acc.image || '',
            isActive: acc.is_active !== false,
            isPhotoFrame: acc.is_photo_frame || false
        };
    });
}

export async function getThemes() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error("Error fetching themes:", error);
        return [];
    }
    return (data || []).filter(Boolean).map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        value: t.value || '',
        pageBackground: t.page_background || t.pageBackground || '#f5f5f5',
        imageUrl: t.image_url || t.imageUrl || '',
        imagePath: t.image_path || t.imagePath || '',
        isActive: t.is_active !== false
    }));
}


export async function getSkins() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('skins')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error("Error fetching skins:", error);
        return [];
    }
    return (data || []).filter(Boolean).map(s => ({
        id: s.id,
        name: s.name,
        imageUrl: s.image_url || s.imageUrl || '',
        imagePath: s.image_path || s.imagePath || '',
        frameColor: s.frame_color || s.frameColor || '#8B5E3C'
    }));
}



export async function saveTheme(theme) {
    if (!supabase) return;

    const dbTheme = {
        name: theme.name,
        type: theme.type,
        value: theme.value,
        page_background: theme.pageBackground,
        image_url: theme.imageUrl,
        image_path: theme.imagePath,
        is_active: true
    };


    const { error } = await supabase
        .from('themes')
        .upsert(dbTheme, { onConflict: 'name' }); // Using name as conflict key if ID isn't provided

    if (error) {
        console.error("Error saving theme:", error);
    }
}

export async function deleteThemeFromDB(id) {
    if (!supabase) return;
    const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id);
    if (error) console.error("Error deleting theme:", error);
}

export async function saveSkin(skin) {
    if (!supabase) return;

    const dbSkin = {
        id: skin.id || skin.name.toLowerCase().replace(/\s+/g, '_'),
        name: skin.name,
        image_url: skin.imageUrl,
        image_path: skin.imagePath,
        frame_color: skin.frameColor,
        is_active: true
    };


    const { error } = await supabase
        .from('skins')
        .upsert(dbSkin, { onConflict: 'id' });

    if (error) {
        console.error("Error saving skin:", error);
    }
}

export async function deleteSkinFromDB(id) {
    if (!supabase) return;
    const { error } = await supabase
        .from('skins')
        .delete()
        .eq('id', id);
    if (error) console.error("Error deleting skin:", error);
}

export async function uploadSkinImage(file) {
    if (!supabase || !file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `skins/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('assets') // Assuming 'assets' bucket exists, else 'public' or 'skins'
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading skin:", uploadError);
        return null;
    }

    return filePath;
}

export async function uploadAccessoryImage(file) {
    if (!supabase || !file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `accessories/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading accessory:", uploadError);
        return null;
    }

    return filePath;
}

export async function uploadThemeImage(file) {
    if (!supabase || !file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `themes/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading theme:", uploadError);
        return null;
    }

    return filePath;
}

export async function saveAccessory(accessory) {
    if (!supabase) return;

    const dbAccessory = {
        id: accessory.id || Date.now().toString(),
        name: accessory.name,
        category: accessory.category,
        rarity: accessory.rarity,
        image: accessory.image, // Legacy column
        image_url: accessory.imageUrl,
        image_path: accessory.imagePath,
        is_active: accessory.isActive !== false,
        is_photo_frame: accessory.isPhotoFrame || false
    };

    const { error } = await supabase
        .from('accessories')
        .upsert(dbAccessory); // id is primary key

    if (error) {
        console.error("Error saving accessory:", error);
    }
}

export async function deleteAccessoryFromDB(id) {
    if (!supabase) return;
    const { error } = await supabase
        .from('accessories')
        .delete()
        .eq('id', id);
    if (error) console.error("Error deleting accessory:", error);
}
