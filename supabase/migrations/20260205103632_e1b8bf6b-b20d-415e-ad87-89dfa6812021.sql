-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  university TEXT,
  course TEXT,
  semester TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create universities table
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  location TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_papers table
CREATE TABLE public.question_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  course TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  year INTEGER NOT NULL,
  pdf_url TEXT,
  pdf_storage_path TEXT,
  is_external_link BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mock_tests table
CREATE TABLE public.mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_attempts table (user test history)
CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_paper_id UUID REFERENCES public.question_papers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_paper_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'moderator')
  )
$$;

-- Profile RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User roles RLS (only admins can view/manage roles)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Universities RLS (public read, admin/mod write)
CREATE POLICY "Anyone can view universities"
  ON public.universities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage universities"
  ON public.universities FOR ALL
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Question papers RLS (public read, admin/mod write)
CREATE POLICY "Anyone can view question papers"
  ON public.question_papers FOR SELECT
  USING (true);

CREATE POLICY "Admins and mods can manage papers"
  ON public.question_papers FOR ALL
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Mock tests RLS (public read active tests, admin/mod write)
CREATE POLICY "Anyone can view active mock tests"
  ON public.mock_tests FOR SELECT
  USING (is_active = true OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins and mods can manage tests"
  ON public.mock_tests FOR ALL
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Questions RLS
CREATE POLICY "Anyone can view questions of active tests"
  ON public.questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mock_tests 
    WHERE id = mock_test_id AND (is_active = true OR public.is_admin_or_moderator(auth.uid()))
  ));

CREATE POLICY "Admins and mods can manage questions"
  ON public.questions FOR ALL
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Test attempts RLS (users can only see their own)
CREATE POLICY "Users can view own attempts"
  ON public.test_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own attempts"
  ON public.test_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Bookmarks RLS (users can only manage their own)
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
  ON public.bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_papers_updated_at
  BEFORE UPDATE ON public.question_papers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mock_tests_updated_at
  BEFORE UPDATE ON public.mock_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('question-papers', 'question-papers', true);

-- Storage policies for question papers
CREATE POLICY "Anyone can view question papers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-papers');

CREATE POLICY "Admins and mods can upload papers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'question-papers' AND public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins and mods can update papers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'question-papers' AND public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins and mods can delete papers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'question-papers' AND public.is_admin_or_moderator(auth.uid()));