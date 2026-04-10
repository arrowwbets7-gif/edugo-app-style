import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Play, ClipboardCheck, CheckCircle2, Loader2 } from "lucide-react";

const DailyGoals = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOrCreateGoal();
  }, [user]);

  const fetchOrCreateGoal = async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("daily_goals" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("goal_date", today)
      .maybeSingle();

    if (data) {
      setGoal(data);
    } else {
      // Count today's actual progress
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [watchRes, quizRes] = await Promise.all([
        supabase
          .from("video_watch_history" as any)
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("watched_at", todayStart.toISOString()),
        supabase
          .from("quiz_attempts")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .gte("submitted_at", todayStart.toISOString()),
      ]);

      const videosWatched = (watchRes as any).count || 0;
      const quizzesCompleted = (quizRes as any).count || 0;

      const { data: newGoal } = await supabase
        .from("daily_goals" as any)
        .insert({
          user_id: user.id,
          goal_date: today,
          target_videos: 3,
          target_quizzes: 1,
          videos_watched: videosWatched,
          quizzes_completed: quizzesCompleted,
          is_completed: videosWatched >= 3 && quizzesCompleted >= 1,
        })
        .select("*")
        .single();

      if (newGoal) setGoal(newGoal);
    }
    setLoading(false);
  };

  if (loading || !goal) {
    return null;
  }

  const videoPct = Math.min(100, Math.round(((goal as any).videos_watched / (goal as any).target_videos) * 100));
  const quizPct = Math.min(100, Math.round(((goal as any).quizzes_completed / (goal as any).target_quizzes) * 100));
  const totalPct = Math.round((videoPct + quizPct) / 2);
  const allDone = (goal as any).is_completed;

  return (
    <Card className={`border-0 shadow-sm overflow-hidden ${allDone ? "bg-gradient-to-r from-accent/10 to-accent/5" : "bg-gradient-to-r from-primary/5 to-accent/5"}`}>
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {allDone ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <Target className="w-5 h-5 text-primary" />
            )}
            <h4 className="text-sm font-bold">
              {allDone ? "Goals Complete! 🎉" : "Today's Goals"}
            </h4>
          </div>
          <span className="text-xs font-bold text-muted-foreground">{totalPct}%</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Play className="w-4 h-4 text-accent flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-xs">Videos</span>
                <span className="text-xs font-semibold">{(goal as any).videos_watched}/{(goal as any).target_videos}</span>
              </div>
              <Progress value={videoPct} className="h-1.5" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-xs">Quizzes</span>
                <span className="text-xs font-semibold">{(goal as any).quizzes_completed}/{(goal as any).target_quizzes}</span>
              </div>
              <Progress value={quizPct} className="h-1.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyGoals;
