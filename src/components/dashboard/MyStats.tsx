import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Eye, CheckCircle2, Flame, TrendingUp, Clock, BookOpen, Award, BarChart3, Loader2,
} from "lucide-react";

interface QuizStat {
  quiz_title: string;
  score: number;
  total_marks: number;
  submitted_at: string;
}

const MyStats = () => {
  const { user } = useAuth();
  const [watchCount, setWatchCount] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [quizHistory, setQuizHistory] = useState<QuizStat[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);

    const [watchRes, watchTimeRes, quizRes, streakRes, attRes, bookmarkRes, noteRes] = await Promise.all([
      supabase.from("video_watch_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("video_watch_history").select("watch_duration_seconds").eq("user_id", user.id),
      supabase.from("quiz_attempts").select("score, total_marks, submitted_at, quiz_id").eq("student_id", user.id).order("submitted_at", { ascending: false }).limit(10),
      supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
      supabase.from("attendance").select("id", { count: "exact", head: true }).eq("student_id", user.id),
      supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("student_notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    setWatchCount((watchRes as any).count || 0);
    setAttendanceCount((attRes as any).count || 0);
    setBookmarkCount((bookmarkRes as any).count || 0);
    setNoteCount((noteRes as any).count || 0);

    // Total watch time
    if (watchTimeRes.data) {
      const total = watchTimeRes.data.reduce((acc: number, r: any) => acc + (r.watch_duration_seconds || 0), 0);
      setTotalWatchTime(total);
    }

    // Streak
    if (streakRes.data) {
      setStreak({ current: streakRes.data.current_streak, longest: streakRes.data.longest_streak });
    }

    // Quiz history with titles
    if (quizRes.data && quizRes.data.length > 0) {
      const quizIds = [...new Set(quizRes.data.map((q: any) => q.quiz_id))];
      const { data: quizzes } = await supabase.from("quizzes").select("id, title").in("id", quizIds);
      const quizMap = new Map<string, string>();
      (quizzes || []).forEach((q: any) => quizMap.set(q.id, q.title));

      setQuizHistory(
        quizRes.data.map((q: any) => ({
          quiz_title: quizMap.get(q.quiz_id) || "Quiz",
          score: q.score,
          total_marks: q.total_marks,
          submitted_at: q.submitted_at,
        }))
      );
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const quizAvg = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((a, q) => a + (q.score / q.total_marks) * 100, 0) / quizHistory.length)
    : 0;
  const quizBest = quizHistory.length > 0
    ? Math.max(...quizHistory.map((q) => Math.round((q.score / q.total_marks) * 100)))
    : 0;

  return (
    <div className="space-y-4">
      {/* Overview stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-accent/5">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold">{watchCount}</p>
              <p className="text-[11px] text-muted-foreground">Videos Watched</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-primary/5">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatTime(totalWatchTime)}</p>
              <p className="text-[11px] text-muted-foreground">Watch Time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-accent/5">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold">{quizHistory.length}</p>
              <p className="text-[11px] text-muted-foreground">Quizzes Done</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-primary/5">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{streak.current}</p>
              <p className="text-[11px] text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 bg-secondary/60">
          <CardContent className="p-3 text-center">
            <BarChart3 className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{attendanceCount}</p>
            <p className="text-[10px] text-muted-foreground">Live Classes</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary/60">
          <CardContent className="p-3 text-center">
            <BookOpen className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{bookmarkCount}</p>
            <p className="text-[10px] text-muted-foreground">Bookmarks</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary/60">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold">{noteCount}</p>
            <p className="text-[10px] text-muted-foreground">Notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quiz performance */}
      {quizHistory.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" /> Quiz Performance
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{quizBest}%</p>
                <p className="text-[10px] text-muted-foreground">Best Score</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{quizAvg}%</p>
                <p className="text-[10px] text-muted-foreground">Average</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">{streak.longest}</p>
                <p className="text-[10px] text-muted-foreground">Best Streak</p>
              </div>
            </div>

            <h5 className="text-xs font-semibold text-muted-foreground mb-2">Recent Quizzes</h5>
            <div className="space-y-2.5">
              {quizHistory.slice(0, 5).map((q, i) => {
                const pct = Math.round((q.score / q.total_marks) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium truncate flex-1 pr-2">{q.quiz_title}</p>
                      <span className={`text-sm font-bold ${pct >= 70 ? "text-accent" : pct >= 40 ? "text-primary" : "text-destructive"}`}>
                        {q.score}/{q.total_marks}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(q.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {quizHistory.length === 0 && watchCount === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Start watching videos and taking quizzes to see your stats!</p>
        </div>
      )}
    </div>
  );
};

export default MyStats;
