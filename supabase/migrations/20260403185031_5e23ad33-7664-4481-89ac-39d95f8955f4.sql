
-- Add is_banned column to profiles for user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text;

-- Add status column to question_papers for content moderation
ALTER TABLE public.question_papers ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

-- Update the public view policy for question_papers to only show approved papers
DROP POLICY IF EXISTS "Anyone can view question papers" ON public.question_papers;
CREATE POLICY "Anyone can view approved papers" ON public.question_papers
  FOR SELECT TO public
  USING (status = 'approved' OR is_admin_or_moderator(auth.uid()));

-- Allow authenticated users to submit papers for review
CREATE POLICY "Authenticated users can submit papers" ON public.question_papers
  FOR INSERT TO authenticated
  WITH CHECK (status = 'pending' OR is_admin_or_moderator(auth.uid()));
