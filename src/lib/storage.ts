import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an image file to the 'user-photos' bucket in Supabase Storage.
 * 
 * @param userId - The ID of the user the photo belongs to.
 * @param file - The File object to upload.
 * @returns An object with the data or error.
 */
export const uploadUserPhoto = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
        .from('user-photos')
        .upload(filePath, file);

    if (error) {
        return { data: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath);

    return { data: { publicUrl }, error: null };
};

/**
 * Removes a photo from Supabase Storage.
 * 
 * @param photoUrl - The public URL of the photo to remove.
 * @returns An object with the error if any.
 */
export const deleteUserPhoto = async (photoUrl: string) => {
    try {
        // Extract the path from the public URL
        // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/user-photos/[path]
        const url = new URL(photoUrl);
        const pathParts = url.pathname.split('/user-photos/');
        if (pathParts.length < 2) return { error: new Error('Invalid photo URL') };

        const filePath = pathParts[1];
        const { error } = await supabase.storage
            .from('user-photos')
            .remove([filePath]);

        return { error };
    } catch (error) {
        return { error: error as Error };
    }
};
