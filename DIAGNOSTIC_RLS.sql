-- DIAGNOSTIC RLS: Allow ALL authenticated users to view ALL messages
-- This is to verify if RLS is the cause of the fetch failure.

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages they are part of" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Diagnostic Read All" ON public.messages;

-- Create permissive policy
CREATE POLICY "Diagnostic Read All"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

SELECT 'Diagnostic RLS enabled: All authenticated users can read all messages.' as result;
