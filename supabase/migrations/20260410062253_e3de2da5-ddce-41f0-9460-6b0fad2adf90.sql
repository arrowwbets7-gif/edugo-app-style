
-- Allow teachers/admins to delete profiles
CREATE POLICY "Teachers can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow teachers/admins to delete user_roles
CREATE POLICY "Teachers can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add unique constraint on attendance for upsert
ALTER TABLE public.attendance ADD CONSTRAINT attendance_stream_student_unique UNIQUE (stream_id, student_id);
