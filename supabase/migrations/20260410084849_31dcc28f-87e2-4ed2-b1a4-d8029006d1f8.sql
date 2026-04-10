
-- Video watch history for progress tracking
CREATE TABLE public.video_watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration_seconds INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watch history" ON public.video_watch_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watch history" ON public.video_watch_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can view all watch history" ON public.video_watch_history FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Daily goals for study planner
CREATE TABLE public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_videos INTEGER NOT NULL DEFAULT 3,
  target_quizzes INTEGER NOT NULL DEFAULT 1,
  videos_watched INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.daily_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.daily_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.daily_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Teachers can view all goals" ON public.daily_goals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow students to see each other's streaks for leaderboard
CREATE POLICY "Authenticated users can view all streaks for leaderboard" ON public.streaks FOR SELECT TO authenticated USING (true);

-- Allow students to see each other's profiles for leaderboard names
CREATE POLICY "Authenticated users can view all profiles for leaderboard" ON public.profiles FOR SELECT TO authenticated USING (true);
