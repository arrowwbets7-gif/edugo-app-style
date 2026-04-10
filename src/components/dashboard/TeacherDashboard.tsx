import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  LogOut, Home, Users, Video, CheckCircle2, XCircle,
  Search, Trash2, Plus, ShieldCheck, Clock, Loader2, LinkIcon, Megaphone,
  Radio, Sparkles, RefreshCw, BarChart3, ClipboardCheck, BookOpen, UserX,
  TrendingUp, Activity, Eye, Flame, Award
} from "lucide-react";
import { toast } from "sonner";
import PostsSection from "./PostsSection";
import CreatePostForm from "./CreatePostForm";
import LiveStreamSection from "./LiveStreamSection";
import CreatePollForm from "./CreatePollForm";
import PollsSection from "./PollsSection";
import CreateQuizForm from "./CreateQuizForm";
import QuizzesSection from "./QuizzesSection";
import AssignmentsSection from "./AssignmentsSection";

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  class: string;
  verification_code: string;
  is_verified: boolean;
  created_at: string;
}

interface VideoItem {
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
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const TeacherDashboard = () => {
  const { signOut } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [studentFilter, setStudentFilter] = useState<"all" | "verified" | "pending">("all");
  const [videoClassFilter, setVideoClassFilter] = useState("");

  // Analytics state
  const [quizCount, setQuizCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [liveStreamCount, setLiveStreamCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [topStreaks, setTopStreaks] = useState<{ name: string; streak: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string }[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchVideos();
    fetchAnalytics();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setStudents(data);
  };

  const fetchVideos = async () => {
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (data) setVideos(data as VideoItem[]);
  };

  const fetchAnalytics = async () => {
    const [quizRes, attemptRes, streamRes, postRes, streakRes] = await Promise.all([
      supabase.from("quizzes").select("*", { count: "exact", head: true }),
      supabase.from("quiz_attempts").select("*", { count: "exact", head: true }),
      supabase.from("live_streams").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("streaks").select("user_id, current_streak").order("current_streak", { ascending: false }).limit(5),
    ]);
    setQuizCount(quizRes.count || 0);
    setTotalAttempts(attemptRes.count || 0);
    setLiveStreamCount(streamRes.count || 0);
    setPostCount(postRes.count || 0);

    if (streakRes.data && streakRes.data.length > 0) {
      const userIds = streakRes.data.map((s: any) => s.user_id);
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profs?.forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
      setTopStreaks(streakRes.data.map((s: any) => ({
        name: nameMap[s.user_id] || "Student",
        streak: s.current_streak,
      })));
    }

    // Recent activity from quiz attempts
    const { data: recentAttempts } = await supabase.from("quiz_attempts").select("student_id, submitted_at, score, total_marks").order("submitted_at", { ascending: false }).limit(5);
    if (recentAttempts && recentAttempts.length > 0) {
      const userIds = recentAttempts.map((a: any) => a.student_id);
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profs?.forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
      setRecentActivity(recentAttempts.map((a: any) => ({
        text: `${nameMap[a.student_id] || "Student"} scored ${a.score}/${a.total_marks}`,
        time: new Date(a.submitted_at).toLocaleDateString(),
      })));
    }
  };

  const verifyStudent = async (userId: string) => {
    const { error } = await supabase.from("profiles").update({ is_verified: true }).eq("user_id", userId);
    if (error) toast.error("Failed to verify student");
    else { toast.success("Student verified!"); fetchStudents(); }
  };

  const revokeVerification = async (userId: string) => {
    const { error } = await supabase.from("profiles").update({ is_verified: false }).eq("user_id", userId);
    if (error) toast.error("Failed to revoke verification");
    else { toast.success("Verification revoked"); fetchStudents(); }
  };

  const removeStudent = async (userId: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("user_id", userId);
    toast.success("Student removed");
    fetchStudents();
  };

  const handleAiSuggest = async () => {
    const ytId = extractYouTubeId(videoUrl);
    if (!ytId) { toast.error("Enter a valid YouTube URL first"); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-video-helper", {
        body: { youtubeUrl: videoUrl, youtubeId: ytId },
      });
      if (error) throw error;
      if (data?.title) setTitle(data.title);
      if (data?.description) setDescription(data.description);
      if (data?.subject) setSubject(data.subject);
      toast.success("AI suggestions applied!");
    } catch {
      toast.error("AI suggestion failed. You can fill in manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) { toast.error("Title and YouTube link are required"); return; }
    const ytId = extractYouTubeId(videoUrl.trim());
    if (!ytId) { toast.error("Please enter a valid YouTube link"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("videos").insert({
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        thumbnail_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        uploaded_by: user.id,
        subject: subject.trim(),
      });
      if (error) throw error;
      toast.success("Video added successfully!");
      setTitle(""); setDescription(""); setVideoUrl(""); setSubject("");
      setShowUpload(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to add video");
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (video: VideoItem) => {
    const { error } = await supabase.from("videos").delete().eq("id", video.id);
    if (error) toast.error("Failed to delete video");
    else { toast.success("Video deleted"); fetchVideos(); }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = !searchCode.trim() || 
      s.verification_code.toLowerCase().includes(searchCode.toLowerCase()) || 
      s.full_name.toLowerCase().includes(searchCode.toLowerCase()) || 
      s.email.toLowerCase().includes(searchCode.toLowerCase());
    const matchesFilter = studentFilter === "all" || 
      (studentFilter === "verified" && s.is_verified) || 
      (studentFilter === "pending" && !s.is_verified);
    return matchesSearch && matchesFilter;
  });

  const verifiedCount = students.filter((s) => s.is_verified).length;
  const pendingCount = students.filter((s) => !s.is_verified).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-lg border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-extrabold font-heading text-primary-foreground">
            EduGo<span className="text-accent">Classes</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">Admin</Badge>
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

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="border-border/50 cursor-pointer" onClick={() => setStudentFilter("all")}>
            <CardContent className="pt-3 pb-2 text-center">
              <p className="text-xl font-bold text-primary">{students.length}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5 cursor-pointer" onClick={() => setStudentFilter("verified")}>
            <CardContent className="pt-3 pb-2 text-center">
              <p className="text-xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-[10px] text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5 cursor-pointer" onClick={() => setStudentFilter("pending")}>
            <CardContent className="pt-3 pb-2 text-center">
              <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-3">
          <TabsList className="w-full grid grid-cols-7 h-auto">
            <TabsTrigger value="overview" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
              <TrendingUp className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
              <Users className="w-4 h-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
              <Video className="w-4 h-4" /> Videos
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
            <TabsTrigger value="homework" className="text-[10px] px-1 py-2 flex flex-col gap-0.5">
              <BookOpen className="w-4 h-4" /> HW
            </TabsTrigger>
          </TabsList>

          {/* Overview / Analytics Tab */}
          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Card className="border-border/50">
                <CardContent className="pt-3 pb-2 text-center">
                  <ClipboardCheck className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold">{quizCount}</p>
                  <p className="text-[10px] text-muted-foreground">Quizzes Created</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-3 pb-2 text-center">
                  <Activity className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{totalAttempts}</p>
                  <p className="text-[10px] text-muted-foreground">Quiz Attempts</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-3 pb-2 text-center">
                  <Radio className="w-5 h-5 text-destructive mx-auto mb-1" />
                  <p className="text-lg font-bold">{liveStreamCount}</p>
                  <p className="text-[10px] text-muted-foreground">Live Sessions</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-3 pb-2 text-center">
                  <Megaphone className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold">{postCount}</p>
                  <p className="text-[10px] text-muted-foreground">Posts</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Streaks */}
            {topStreaks.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-accent" /> Top Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topStreaks.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                        <span className="font-medium truncate">{s.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Flame className="w-3 h-3" /> {s.streak} days
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-xs text-muted-foreground">{a.text}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{a.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick content stats */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" /> Content Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Video className="w-3 h-3" /> <span>{videos.length} Videos</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-3 h-3" /> <span>{students.length} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-3 h-3" /> <span>{verifiedCount} Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" /> <span>{pendingCount} Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="pl-10 h-9" />
              </div>
            </div>
            
            {pendingCount > 0 && studentFilter !== "verified" && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {pendingCount} pending approval
                </p>
              </div>
            )}

            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground text-sm">No students found</CardContent>
                </Card>
              ) : (
                filteredStudents.map((student) => (
                  <Card key={student.id} className={`border-border/50 ${!student.is_verified ? "border-l-2 border-l-amber-500" : ""}`}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="font-semibold text-sm truncate">{student.full_name}</h4>
                            {student.is_verified ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <span>{student.class || "N/A"}</span>
                            <span>•</span>
                            <code className="font-mono font-bold text-foreground">{student.verification_code}</code>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {student.is_verified ? (
                            <Button variant="outline" size="sm" onClick={() => revokeVerification(student.user_id)} className="text-red-500 h-7 text-xs px-2">
                              <XCircle className="w-3 h-3 mr-1" /> Revoke
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => verifyStudent(student.user_id)} className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verify
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => removeStudent(student.user_id)}>
                            <UserX className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-3">
            <div className="flex gap-2">
              {!showUpload && (
                <Button onClick={() => setShowUpload(true)} size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="w-4 h-4 mr-1" /> Add Video
                </Button>
              )}
              <Button
                variant="outline" size="sm"
                onClick={async () => {
                  setSyncing(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("sync-youtube");
                    if (error) throw error;
                    toast.success(data?.message || "Sync complete!");
                    fetchVideos();
                  } catch (err: any) {
                    toast.error(err.message || "Sync failed");
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing}
                className={showUpload ? "w-full" : ""}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync"}
              </Button>
            </div>
            {showUpload && (
              <Card className="border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-accent" /> Add YouTube Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVideo} className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">YouTube Link *</Label>
                      <Input placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required className="h-9" />
                      {videoUrl && extractYouTubeId(videoUrl) && (
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAiSuggest} disabled={aiLoading}>
                          {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                          {aiLoading ? "AI thinking..." : "Auto-fill with AI"}
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Title *</Label>
                      <Input placeholder="Video title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="h-9" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Subject</Label>
                        <Input placeholder="e.g. Math" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={50} className="h-9" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Class / Board</Label>
                        <Input placeholder="e.g. Class 10 CBSE" value={videoClassFilter} onChange={(e) => setVideoClassFilter(e.target.value)} maxLength={50} className="h-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description</Label>
                      <Textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                        {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                        Add
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowUpload(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {videos.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground text-sm">No videos yet</CardContent>
                </Card>
              ) : (
                videos.map((video) => {
                  const ytId = extractYouTubeId(video.video_url);
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : video.thumbnail_url;
                  return (
                    <Card key={video.id} className="border-border/50 overflow-hidden">
                      <div className="flex">
                        {thumb && (
                          <div className="w-28 h-20 bg-muted flex-shrink-0">
                            <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 p-3 flex items-center justify-between gap-2 min-w-0">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm truncate">{video.title}</h4>
                            {video.subject && <Badge variant="outline" className="text-[10px] mt-0.5">{video.subject}</Badge>}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteVideo(video)} className="text-red-400 hover:text-red-600 h-8 w-8 flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-3">
            <LiveStreamSection isTeacher />
          </TabsContent>

          <TabsContent value="posts" className="space-y-3">
            <div className="flex gap-2">
              {!showCreatePost && !showCreatePoll && (
                <>
                  <Button onClick={() => setShowCreatePost(true)} size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Megaphone className="w-4 h-4 mr-1" /> Post
                  </Button>
                  <Button onClick={() => setShowCreatePoll(true)} size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-1" /> Poll
                  </Button>
                </>
              )}
            </div>
            {showCreatePost && <CreatePostForm onCreated={() => setShowCreatePost(false)} onCancel={() => setShowCreatePost(false)} />}
            {showCreatePoll && <CreatePollForm onCreated={() => setShowCreatePoll(false)} onCancel={() => setShowCreatePoll(false)} />}
            <PollsSection isTeacher />
            <PostsSection isTeacher />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-3">
            {!showCreateQuiz ? (
              <Button onClick={() => setShowCreateQuiz(true)} size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-1" /> Create Quiz / Test
              </Button>
            ) : (
              <CreateQuizForm onCreated={() => setShowCreateQuiz(false)} onCancel={() => setShowCreateQuiz(false)} />
            )}
            <QuizzesSection isTeacher />
          </TabsContent>

          <TabsContent value="homework" className="space-y-3">
            <AssignmentsSection isTeacher />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
