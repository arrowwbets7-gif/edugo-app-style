
-- Live streams table
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('scheduled', 'live', 'ended')),
  subject TEXT DEFAULT '',
  class_filter TEXT DEFAULT '',
  started_by UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage live streams"
  ON public.live_streams FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Verified students can view live streams"
  ON public.live_streams FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_verified = true));

CREATE TRIGGER update_live_streams_updated_at
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Live chat messages table
CREATE TABLE public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view chat messages"
  ON public.live_chat_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON public.live_chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update chat messages (pin)"
  ON public.live_chat_messages FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own or teachers can delete any"
  ON public.live_chat_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;

-- Add attachment_type to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT NULL;

-- Storage bucket for post attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('post-attachments', 'post-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload post attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-attachments');

CREATE POLICY "Anyone can view post attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-attachments');

CREATE POLICY "Teachers can delete post attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-attachments' AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
