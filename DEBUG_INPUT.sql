
CREATE OR REPLACE FUNCTION public.debug_input(
    p_tid TEXT,
    p_sid TEXT
) RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'tid_raw', p_tid,
        'tid_len', length(p_tid),
        'sid_raw', p_sid,
        'sid_len', length(p_sid)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
