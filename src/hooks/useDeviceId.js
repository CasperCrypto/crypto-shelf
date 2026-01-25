import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useDeviceId - Stable user identity without auth
 * 
 * Generates a unique device ID on first visit and persists it.
 * Creates/updates a user profile in Supabase.
 * 
 * Returns: { deviceId, isLoading, error }
 */
export const useDeviceId = () => {
    const [deviceId, setDeviceId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initDeviceId = async () => {
            try {
                // Check localStorage first
                let storedId = localStorage.getItem('crypto_shelf_device_id');

                if (!storedId) {
                    // Generate new UUID
                    storedId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                    localStorage.setItem('crypto_shelf_device_id', storedId);
                }

                setDeviceId(storedId);

                // Create/update profile in Supabase if available
                if (supabase) {
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', storedId)
                        .maybeSingle();

                    if (!existingProfile) {
                        // Create new profile
                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: storedId,
                                handle: `user_${storedId.slice(-8)}`,
                                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedId}`,
                                role: 'user',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });

                        if (insertError) {
                            console.warn('Failed to create profile:', insertError);
                        }
                    }
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Device ID initialization error:', err);
                setError(err);
                setIsLoading(false);
            }
        };

        initDeviceId();
    }, []);

    return { deviceId, isLoading, error };
};

/**
 * getDeviceId - Synchronous getter for device ID
 * Use this when you need the ID immediately (assumes already initialized)
 */
export const getDeviceId = () => {
    return localStorage.getItem('crypto_shelf_device_id');
};
