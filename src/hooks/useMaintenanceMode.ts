import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMaintenanceMode = () => {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                setLoading(true);

                // 1. Check Maintenance Mode flag
                const { data: configData, error: configError } = await supabase
                    .from('app_config')
                    .select('value')
                    .eq('key', 'maintenance_mode')
                    .maybeSingle();

                if (configError) {
                    console.error('Error fetching maintenance mode:', configError);
                } else if (configData) {
                    setIsMaintenance(configData.value === 'true');
                }

                // 2. Check if user is Admin
                if (user) {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (userError) {
                        console.error('Error fetching user role:', userError);
                    } else if (userData) {
                        setIsAdmin(userData.role === 'admin');
                    }
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error('Unexpected error in useMaintenanceMode:', err);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();

        // Subscribe to changes in app_config
        const channel = supabase
            .channel('app_config_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'app_config',
                    filter: 'key=eq.maintenance_mode'
                },
                (payload) => {
                    setIsMaintenance(payload.new.value === 'true');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return { isMaintenance, isAdmin, loading };
};
