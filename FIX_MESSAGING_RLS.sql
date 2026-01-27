-- FIX MESSAGING RLS POLICIES
-- The sendMessage function fails to fetch the new message because RLS blocks access.
-- This script explicitly allows participants to view messages.

-- 1. Enable RLS on messages (ensure it's on)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (or duplicates)
DROP POLICY IF EXISTS "Users can view messages they are part of" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages; -- Usually handled by RPC, but good to clean up
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;

-- 3. Create Policy: Users can view messages if they are in the thread
CREATE POLICY "Users can view messages in their threads"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.thread_participants tp 
    WHERE tp.thread_id = messages.thread_id 
    AND tp.user_id = auth.uid()
  )
);

-- 4. Also ensure threads are visible
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their threads" ON public.threads;

CREATE POLICY "Users can view their threads"
ON public.threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.thread_participants tp 
    WHERE tp.thread_id = threads.id 
    AND tp.user_id = auth.uid()
  )
);

-- 5. And thread_participants
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their participations" ON public.thread_participants;

CREATE POLICY "Users can view their participations"
ON public.thread_participants
FOR SELECT
USING (user_id = auth.uid());

SELECT 'Messaging RLS policies applied. You should now be able to fetch your messages.' as result;
