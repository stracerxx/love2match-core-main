
CREATE OR REPLACE FUNCTION public.v10_escrow_robust(
    p_thread_id TEXT,
    p_sender_id TEXT,
    p_content TEXT
) RETURNS JSONB AS $$
BEGIN
    RAISE EXCEPTION 'DEBUG: p_thread_id=%, p_sender_id=%', p_thread_id, p_sender_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
