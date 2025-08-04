-- Create enum for fault types
CREATE TYPE public.fault_type AS ENUM ('fallen_pole', 'sparks', 'outage', 'other');

-- Create enum for fault status
CREATE TYPE public.fault_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');

-- Create fault_reports table
CREATE TABLE public.fault_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fault_type fault_type NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  status fault_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff_feedback table
CREATE TABLE public.staff_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fault_report_id UUID NOT NULL REFERENCES public.fault_reports(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for staff
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fault_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fault_reports (public can insert, authenticated staff can view/update)
CREATE POLICY "Anyone can insert fault reports" 
ON public.fault_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can view all fault reports" 
ON public.fault_reports 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Staff can update fault reports" 
ON public.fault_reports 
FOR UPDATE 
TO authenticated
USING (true);

-- RLS Policies for staff_feedback
CREATE POLICY "Staff can insert feedback" 
ON public.staff_feedback 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Staff can view all feedback" 
ON public.staff_feedback 
FOR SELECT 
TO authenticated
USING (true);

-- RLS Policies for profiles
CREATE POLICY "Staff can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Staff can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Staff can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_fault_reports_updated_at
  BEFORE UPDATE ON public.fault_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();