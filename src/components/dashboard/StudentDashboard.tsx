import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "./NotificationBell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  Copy, CheckCircle2, Clock, LogOut, Home, Play, ShieldCheck, User, Search, Megaphone, Radio,
  ClipboardCheck, BarChart3, Flame, Trophy, Target, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import CustomVideoPlayer from "./CustomVideoPlayer";
import PostsSection from "./PostsSection";
import LiveStreamSection from "./LiveStreamSection";
import PollsSection from "./PollsSection";
import QuizzesSection from "./QuizzesSection";


interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  subject: string;
  created_at: string;
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const StudentDashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [copied, setCopied] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [streak, setStreak] = useState({ current: 0, longest: 0, avatar: "default" });
  const [quizStats, setQuizStats] = useState({ attempted: 0, avgScore: 0, bestScore: 0 });
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    if (profile?.is_verified) {
      fetchVideos();
      updateStreak();
      fetchStudentStats();
    }
  }, [profile?.is_verified]);

  const fetchVideos = async () => {
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (data) setVideos(data as Video[]);
  };

  const fetchStudentStats = async () => {
    if (!user) return;
    const [attRes, quizRes] = await Promise.all([
      supabase.from("attendance").select("*", { count: "exact", head: true }).eq("student_id", user.id),
      supabase.from("quiz_attempts").select("score, total_marks").eq("student_id", user.id),
    ]);
    setAttendanceCount(attRes.count || 0);

    if (quizRes.data && quizRes.data.length > 0) {
      const scores = quizRes.data.map((a: any) => Math.round((a.score / a.total_marks) * 100));
      setQuizStats({
        attempted: quizRes.data.length,
        avgScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
        bestScore: Math.max(...scores),
      });
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle();
    
    if (!data) {
      await supabase.from("streaks").insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_active_date: today });
      setStreak({ current: 1, longest: 1, avatar: "default" });
      return;
    }

    const lastDate = data.last_active_date;
    if (lastDate === today) {
      setStreak({ current: data.current_streak, longest: data.longest_streak, avatar: data.avatar_reward || "default" });
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = lastDate === yesterdayStr ? data.current_streak + 1 : 1;
    let newLongest = Math.max(newStreak, data.longest_streak);
    let avatar = data.avatar_reward || "default";
    
    if (newStreak >= 30) avatar = "🏆";
    else if (newStreak >= 21) avatar = "💎";
    else if (newStreak >= 14) avatar = "🌟";
    else if (newStreak >= 7) avatar = "🔥";
    else if (newStreak >= 3) avatar = "⭐";

    await supabase.from("streaks").update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active_date: today,
      avatar_reward: avatar,
    }).eq("user_id", user.id);

    setStreak({ current: newStreak, longest: newLongest, avatar });
  };

  const copyCode = () => {
    if (profile?.verification_code) {
      navigator.clipboard.writeText(profile.verification_code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const subjects = [...new Set(videos.map((v) => v.subject).filter(Boolean))];
  const filteredVideos = videos.filter((v) => {
    const matchesSearch = !searchQuery.trim() || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || v.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-background">
      {playingVideo && (
        <CustomVideoPlayer youtubeId={playingVideo.id} title={playingVideo.title} onClose={() => setPlayingVideo(null)} />
      )}

      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-lg border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-extrabold font-heading text-primary-foreground">
            EduGo<span className="text-accent">Classes</span>
          </Link>
          <div className="flex items-center gap-2">
            {streak.current > 0 && (
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs gap-1">
                <Flame className="w-3 h-3" /> {streak.current} day{streak.current > 1 ? "s" : ""}
              </Badge>
            )}
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground/70 hover:text-primary-foreground">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl space-y-4">
        {/* Profile Card */}
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                {streak.avatar !== "default" ? streak.avatar : <User className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{profile?.full_name}</h3>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{profile?.class || "N/A"}</span>
                  {profile?.is_verified ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] h-5">
                      <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      <Clock className="w-3 h-3 mr-0.5" /> Pending
                    </Badge>
                  )}
                </div>
              </div>
              {streak.current >= 3 && (
                <div className="text-center">
                  <Flame className="w-6 h-6 text-accent mx-auto" />
                  <p className="text-[10px] font-bold">{streak.current}🔥</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats for verified students */}
        {profile?.is_verified && (quizStats.attempted > 0 || attendanceCount > 0) && (
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-border/50">
              <CardContent className="pt-2.5 pb-2 text-center">
                <Trophy className="w-4 h-4 text-accent mx-auto mb-0.5" />
                <p className="text-sm font-bold">{quizStats.bestScore}%</p>
                <p className="text-[9px] text-muted-foreground">Best Score</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-2.5 pb-2 text-center">
                <Target className="w-4 h-4 text-primary mx-auto mb-0.5" />
                <p className="text-sm font-bold">{quizStats.avgScore}%</p>
                <p className="text-[9px] text-muted-foreground">Avg Score</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-2.5 pb-2 text-center">
                <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-0.5" />
                <p className="text-sm font-bold">{attendanceCount}</p>
                <p className="text-[9px] text-muted-foreground">Classes Attended</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Code */}
        {!profile?.is_verified && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="text-center">
                <h3 className="font-bold mb-1">Your Verification Code</h3>
                <p className="text-xs text-muted-foreground mb-3">Share with your teacher to get verified</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold tracking-[0.3em] bg-card px-4 py-2 rounded-xl border">{profile?.verification_code}</code>
                  <Button variant="outline" size="icon" className="h-10 w-10" onClick={copyCode}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={refreshProfile}>Check Status</Button>
            </CardContent>
          </Card>
        )}

        {/* Content tabs */}
        {profile?.is_verified ? (
          <Tabs defaultValue="videos" className="space-y-3">
            <TabsList className="w-full grid grid-cols-5 h-auto">
              <TabsTrigger value="videos" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
                <Play className="w-4 h-4" /> Videos
              </TabsTrigger>
              <TabsTrigger value="live" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
                <Radio className="w-4 h-4" /> Live
              </TabsTrigger>
              <TabsTrigger value="posts" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
                <Megaphone className="w-4 h-4" /> Posts
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
                <ClipboardCheck className="w-4 h-4" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="polls" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
                <BarChart3 className="w-4 h-4" /> Polls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-9" />
                </div>
                {subjects.length > 0 && (
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {filteredVideos.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                    {videos.length === 0 ? "No videos yet." : "No match."}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {filteredVideos.map((video) => {
                    const ytId = extractYouTubeId(video.video_url);
                    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : video.thumbnail_url;
                    return (
                      <Card key={video.id} className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => ytId && setPlayingVideo({ id: ytId, title: video.title })}
                        onContextMenu={(e) => e.preventDefault()}>
                        <div className="relative">
                          {thumb && (
                            <div className="relative w-full aspect-video bg-muted">
                              <img src={thumb} alt={video.title} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                  <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm">{video.title}</h3>
                              {video.subject && <Badge variant="outline" className="text-[10px] flex-shrink-0">{video.subject}</Badge>}
                            </div>
                            {video.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.description}</p>}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="live">
              <LiveStreamSection />
            </TabsContent>

            <TabsContent value="posts">
              <PostsSection />
            </TabsContent>

            <TabsContent value="quizzes">
              <QuizzesSection />
            </TabsContent>


            <TabsContent value="polls">
              <PollsSection />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <Play className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Content available after verification</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
