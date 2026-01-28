
CREATE OR REPLACE FUNCTION public.escrow_v13_final(
    p_tid TEXT,
    p_sid TEXT,
    p_content TEXT
) RETURNS JSONB AS $$
DECLARE
    v_tid UUID;
    v_sid UUID;
BEGIN
    BEGIN
        v_tid := p_tid::uuid;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', 'TID CAST FAIL: ' || SQLERRM, 'val', p_tid);
    END;

    BEGIN
        v_sid := p_sid::uuid;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', 'SID CAST FAIL: ' || SQLERRM, 'val', p_sid);
    END;

    RETURN jsonb_build_object('success', true, 'tid', v_tid, 'sid', v_sid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
