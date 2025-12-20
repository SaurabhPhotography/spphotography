-- Create enum for media types
CREATE TYPE public.media_type AS ENUM ('photo', 'video');

-- Create enum for portfolio categories
CREATE TYPE public.portfolio_category AS ENUM ('wedding', 'pre-wedding', 'baby-shower-maternity', 'birthdays-family', 'drone', 'model-candid');

-- Create portfolio_items table
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_type media_type NOT NULL,
  category portfolio_category NOT NULL,
  embed_url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public read access for everyone (portfolio is public)
CREATE POLICY "Anyone can view portfolio items"
ON public.portfolio_items
FOR SELECT
USING (true);

-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin can view all roles
CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert portfolio items
CREATE POLICY "Admins can insert portfolio items"
ON public.portfolio_items
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update portfolio items
CREATE POLICY "Admins can update portfolio items"
ON public.portfolio_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete portfolio items
CREATE POLICY "Admins can delete portfolio items"
ON public.portfolio_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));