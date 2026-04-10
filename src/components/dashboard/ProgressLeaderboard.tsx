import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, TrendingUp, Eye, CheckCircle2, Flame, Crown, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
}

interface QuizStat {
  quiz_title: string;
  score: number;
  total_marks: number;
  submitted_at: string;
}

export const ProgressLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizStat[]>([]);
  const [watchCount, setWatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch leaderboard (all streaks + profile names)
    const [streaksRes, profilesRes, watchRes, quizRes] = await Promise.all([
      supabase.from("streaks").select("user_id, current_streak, longest_streak").order("current_streak", { ascending: false }).limit(20),
      supabase.from("profiles").select("user_id, full_name, avatar_url"),
      supabase.from("video_watch_history" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("quiz_attempts").select("score, total_marks, submitted_at, quiz_id").eq("student_id", user.id).order("submitted_at", { ascending: false }).limit(10),
    ]);

    // Build leaderboard
    if (streaksRes.data && profilesRes.data) {
      const profileMap = new Map<string, any>();
      (profilesRes.data as any[]).forEach((p: any) => profileMap.set(p.user_id, p));
      const entries: LeaderboardEntry[] = (streaksRes.data as any[])
        .filter((s: any) => s.current_streak > 0 && profileMap.has(s.user_id))
        .map((s: any) => ({
          user_id: s.user_id,
          full_name: profileMap.get(s.user_id)?.full_name || "Student",
          avatar_url: profileMap.get(s.user_id)?.avatar_url,
          current_streak: s.current_streak,
          longest_streak: s.longest_streak,
        }));
      setLeaderboard(entries);
    }

    setWatchCount((watchRes as any).count || 0);

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-accent" />;
    if (index === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (index === 2) return <Medal className="w-5 h-5 text-primary" />;
    return <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{index + 1}</span>;
  };

  return (
    <Tabs defaultValue="leaderboard" className="space-y-3">
      <TabsList className="w-full grid grid-cols-2 h-10 rounded-xl bg-secondary/60">
        <TabsTrigger value="leaderboard" className="rounded-lg text-xs">
          <Trophy className="w-3.5 h-3.5 mr-1" /> Leaderboard
        </TabsTrigger>
        <TabsTrigger value="my-progress" className="rounded-lg text-xs">
          <TrendingUp className="w-3.5 h-3.5 mr-1" /> My Progress
        </TabsTrigger>
      </TabsList>

      <TabsContent value="leaderboard" className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No streak data yet</p>
          </div>
        ) : (
          leaderboard.map((entry, i) => {
            const isMe = entry.user_id === user?.id;
            return (
              <Card key={entry.user_id} className={`border-0 shadow-sm ${isMe ? "ring-2 ring-accent/30 bg-accent/5" : ""}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  {getRankIcon(i)}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">{entry.full_name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {entry.full_name} {isMe && <span className="text-xs text-accent">(You)</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Best: {entry.longest_streak} days</p>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/10 rounded-full px-2.5 py-1">
                    <Flame className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm font-bold">{entry.current_streak}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      <TabsContent value="my-progress" className="space-y-4">
        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-accent/5">
            <CardContent className="p-3 text-center">
              <Eye className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold">{watchCount}</p>
              <p className="text-[11px] text-muted-foreground">Videos Watched</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{quizHistory.length}</p>
              <p className="text-[11px] text-muted-foreground">Quizzes Done</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent quiz results */}
        {quizHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recent Quizzes</h4>
            {quizHistory.slice(0, 5).map((q, i) => {
              const pct = Math.round((q.score / q.total_marks) * 100);
              return (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-medium truncate flex-1">{q.quiz_title}</p>
                      <span className={`text-sm font-bold ${pct >= 70 ? "text-accent" : pct >= 40 ? "text-primary" : "text-destructive"}`}>
                        {q.score}/{q.total_marks}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(q.submitted_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {quizHistory.length === 0 && watchCount === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Start watching videos and taking quizzes!</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProgressLeaderboard;
