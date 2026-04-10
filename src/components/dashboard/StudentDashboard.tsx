import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "./NotificationBell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  Copy, CheckCircle2, Clock, LogOut, Home, Play, ShieldCheck, User, Search, Megaphone, Radio,
  ClipboardCheck, BarChart3, Flame, Trophy, Target, TrendingUp, Sparkles
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

      const videoChannel = supabase
        .channel("videos-realtime")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "videos",
        }, () => fetchVideos())
        .subscribe();

      return () => { supabase.removeChannel(videoChannel); };
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

    if (newStreak >= 30) avatar = "gold";
    else if (newStreak >= 21) avatar = "diamond";
    else if (newStreak >= 14) avatar = "star";
    else if (newStreak >= 7) avatar = "fire";
    else if (newStreak >= 3) avatar = "spark";

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

  const streakIcon = streak.current >= 7 ? <Flame className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />;

  return (
    <div className="min-h-screen bg-background">
      {playingVideo && (
        <CustomVideoPlayer youtubeId={playingVideo.id} title={playingVideo.title} onClose={() => setPlayingVideo(null)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary backdrop-blur-lg">
        <div className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
          <Link to="/" className="text-lg font-extrabold font-heading text-primary-foreground">
            EduGo<span className="text-accent">Classes</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            {streak.current > 0 && (
              <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-full px-2.5 py-1">
                <Flame className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-bold text-primary-foreground">{streak.current}</span>
              </div>
            )}
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/60 hover:text-primary-foreground">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 text-primary-foreground/60 hover:text-primary-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Profile Card - Minimal */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{profile?.full_name}</h3>
              {profile?.is_verified ? (
                <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{profile?.class || "N/A"}</p>
          </div>
        </div>

        {/* Quick Stats */}
        {profile?.is_verified && (quizStats.attempted > 0 || attendanceCount > 0) && (
          <div className="grid grid-cols-3 gap-2 animate-fade-in">
            <Card className="border-0 bg-accent/5">
              <CardContent className="pt-3 pb-2.5 text-center">
                <Trophy className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-base font-bold">{quizStats.bestScore}%</p>
                <p className="text-[10px] text-muted-foreground">Best</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary/5">
              <CardContent className="pt-3 pb-2.5 text-center">
                <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-base font-bold">{quizStats.avgScore}%</p>
                <p className="text-[10px] text-muted-foreground">Average</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-accent/5">
              <CardContent className="pt-3 pb-2.5 text-center">
                <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-base font-bold">{attendanceCount}</p>
                <p className="text-[10px] text-muted-foreground">Classes</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Code */}
        {!profile?.is_verified && (
          <Card className="border-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent animate-fade-in overflow-hidden">
            <CardContent className="pt-5 pb-5 space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-sm">Your Verification Code</h3>
                <p className="text-xs text-muted-foreground mt-1">Share this code with your teacher</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <code className="text-2xl font-mono font-bold tracking-[0.3em] bg-card px-5 py-2.5 rounded-2xl border border-border/50 shadow-sm">
                  {profile?.verification_code}
                </code>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={copyCode}>
                  {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl h-9" onClick={refreshProfile}>
                <Clock className="w-3.5 h-3.5 mr-1.5" /> Check Verification Status
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content tabs */}
        {profile?.is_verified ? (
          <Tabs defaultValue="videos" className="space-y-3 animate-fade-in">
            <TabsList className="w-full grid grid-cols-5 h-11 rounded-2xl bg-secondary/80 p-1">
              <TabsTrigger value="videos" className="rounded-xl text-[10px] px-1 py-1.5 flex flex-col gap-0.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Play className="w-4 h-4" /> Videos
              </TabsTrigger>
              <TabsTrigger value="live" className="rounded-xl text-[10px] px-1 py-1.5 flex flex-col gap-0.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Radio className="w-4 h-4" /> Live
              </TabsTrigger>
              <TabsTrigger value="posts" className="rounded-xl text-[10px] px-1 py-1.5 flex flex-col gap-0.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Megaphone className="w-4 h-4" /> Posts
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="rounded-xl text-[10px] px-1 py-1.5 flex flex-col gap-0.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ClipboardCheck className="w-4 h-4" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="polls" className="rounded-xl text-[10px] px-1 py-1.5 flex flex-col gap-0.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" /> Polls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-secondary/50 border-border/30"
                  />
                </div>
                {subjects.length > 0 && (
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-28 h-10 rounded-xl bg-secondary/50 border-border/30">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {videos.length === 0 ? "No videos yet" : "No results found"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredVideos.map((video) => {
                    const ytId = extractYouTubeId(video.video_url);
                    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : video.thumbnail_url;
                    return (
                      <Card
                        key={video.id}
                        className="border-0 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
                        onClick={() => ytId && setPlayingVideo({ id: ytId, title: video.title })}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <div className="relative">
                          {thumb && (
                            <div className="relative w-full aspect-video bg-muted rounded-t-xl overflow-hidden">
                              <img src={thumb} alt={video.title} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
                              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                  <Play className="w-5 h-5 text-accent ml-0.5" fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm leading-snug">{video.title}</h3>
                              {video.subject && (
                                <Badge variant="outline" className="text-[10px] flex-shrink-0 rounded-lg border-border/50">
                                  {video.subject}
                                </Badge>
                              )}
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
          <div className="text-center py-12 animate-fade-in">
            <Play className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Content available after verification</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
