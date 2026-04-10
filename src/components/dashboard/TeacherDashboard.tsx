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
  Search, Trash2, Plus, ShieldCheck, Clock, GraduationCap, Loader2, LinkIcon, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import PostsSection from "./PostsSection";
import CreatePostForm from "./CreatePostForm";

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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchVideos();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setStudents(data);
  };

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setVideos(data as VideoItem[]);
  };

  const verifyStudent = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("user_id", userId);
    if (error) toast.error("Failed to verify student");
    else { toast.success("Student verified!"); fetchStudents(); }
  };

  const revokeVerification = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: false })
      .eq("user_id", userId);
    if (error) toast.error("Failed to revoke verification");
    else { toast.success("Verification revoked"); fetchStudents(); }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      toast.error("Title and YouTube link are required");
      return;
    }

    const ytId = extractYouTubeId(videoUrl.trim());
    if (!ytId) {
      toast.error("Please enter a valid YouTube link");
      return;
    }

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
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setSubject("");
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
    if (!searchCode.trim()) return true;
    const q = searchCode.toLowerCase();
    return (
      s.verification_code.toLowerCase().includes(q) ||
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
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
            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">Teacher</Badge>
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

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-border/50">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-primary">{students.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="students" className="gap-1">
              <Users className="w-4 h-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1">
              <Video className="w-4 h-4" /> Videos
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1">
              <Megaphone className="w-4 h-4" /> Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or verification code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">No students found</CardContent>
                </Card>
              ) : (
                filteredStudents.map((student) => (
                  <Card key={student.id} className="border-border/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{student.full_name}</h4>
                            {student.is_verified ? (
                              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" /> {student.class || "N/A"}
                            </span>
                            <span>Code: <code className="font-mono font-bold text-foreground">{student.verification_code}</code></span>
                          </div>
                        </div>
                        <div>
                          {student.is_verified ? (
                            <Button variant="outline" size="sm" onClick={() => revokeVerification(student.user_id)} className="text-red-500 hover:text-red-600 border-red-200">
                              <XCircle className="w-4 h-4 mr-1" /> Revoke
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => verifyStudent(student.user_id)} className="bg-green-600 hover:bg-green-700 text-primary-foreground">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            {!showUpload ? (
              <Button onClick={() => setShowUpload(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add YouTube Video
              </Button>
            ) : (
              <Card className="border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-accent" /> Add YouTube Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVideo} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input placeholder="Video title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input placeholder="e.g. Math, Science, English" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={50} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube Link * <span className="text-xs text-muted-foreground">(Unlisted or Public)</span></Label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        required
                      />
                      {videoUrl && extractYouTubeId(videoUrl) && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-border/50">
                          <img
                            src={`https://img.youtube.com/vi/${extractYouTubeId(videoUrl)}/hqdefault.jpg`}
                            alt="Video thumbnail"
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      {videoUrl && !extractYouTubeId(videoUrl) && (
                        <p className="text-xs text-destructive">Invalid YouTube URL</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4 mr-2" /> Add Video</>}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowUpload(false)} disabled={saving}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {videos.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">No videos added yet</CardContent>
                </Card>
              ) : (
                videos.map((video) => {
                  const ytId = extractYouTubeId(video.video_url);
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : video.thumbnail_url;
                  return (
                    <Card key={video.id} className="border-border/50 overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        {thumb && (
                          <div className="sm:w-40 h-24 sm:h-auto bg-muted flex-shrink-0">
                            <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 p-4 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold truncate">{video.title}</h4>
                            {video.subject && <Badge variant="outline" className="text-xs mt-1">{video.subject}</Badge>}
                            {video.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{video.description}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{new Date(video.created_at).toLocaleDateString()}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteVideo(video)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {!showCreatePost ? (
              <Button onClick={() => setShowCreatePost(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create Post
              </Button>
            ) : (
              <CreatePostForm
                onCreated={() => { setShowCreatePost(false); }}
                onCancel={() => setShowCreatePost(false)}
              />
            )}
            <PostsSection isTeacher />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
