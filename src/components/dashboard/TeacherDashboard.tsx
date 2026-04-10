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
  LogOut, Home, Users, Video, Upload, CheckCircle2, XCircle,
  Search, Trash2, Plus, ShieldCheck, Clock, GraduationCap, Loader2
} from "lucide-react";
import { toast } from "sonner";

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
  created_at: string;
}

const TeacherDashboard = () => {
  const { signOut } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<"video" | "thumbnail" | "saving" | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_THUMB_SIZE = 5 * 1024 * 1024; // 5MB

  // Upload form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

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
    if (data) setVideos(data);
  };

  const verifyStudent = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to verify student");
    } else {
      toast.success("Student verified!");
      fetchStudents();
    }
  };

  const revokeVerification = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: false })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to revoke verification");
    } else {
      toast.success("Verification revoked");
      fetchStudents();
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) {
      toast.error("Title and video file are required");
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const videoPath = `${timestamp}_${videoFile.name}`;

      // Upload video
      const { error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoPath, videoFile);
      if (videoError) throw videoError;

      const { data: videoUrlData } = supabase.storage.from("videos").getPublicUrl(videoPath);
      const videoUrl = videoUrlData.publicUrl;

      // Upload thumbnail
      let thumbnailUrl = "";
      if (thumbnailFile) {
        const thumbPath = `${timestamp}_${thumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbPath, thumbnailFile);
        if (thumbError) throw thumbError;
        const { data: thumbUrlData } = supabase.storage.from("thumbnails").getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }

      // Insert video record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("videos").insert({
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        uploaded_by: user.id,
      });
      if (insertError) throw insertError;

      toast.success("Video uploaded successfully!");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setShowUpload(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (video: VideoItem) => {
    const { error } = await supabase.from("videos").delete().eq("id", video.id);
    if (error) {
      toast.error("Failed to delete video");
    } else {
      toast.success("Video deleted");
      fetchVideos();
    }
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
      {/* Header */}
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
        {/* Stats */}
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
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="students" className="gap-1">
              <Users className="w-4 h-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1">
              <Video className="w-4 h-4" /> Videos
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
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
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No students found
                  </CardContent>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeVerification(student.user_id)}
                              className="text-red-500 hover:text-red-600 border-red-200"
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Revoke
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => verifyStudent(student.user_id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
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

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            {!showUpload ? (
              <Button onClick={() => setShowUpload(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" /> Upload New Video
              </Button>
            ) : (
              <Card className="border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" /> Upload Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadVideo} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        placeholder="Video title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Brief description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={1000}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video File *</Label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Thumbnail</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      {thumbnailPreview && (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="w-32 h-20 object-cover rounded-lg mt-2" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={uploading} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                        {uploading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-4 h-4 mr-2" /> Upload</>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {videos.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No videos uploaded yet
                  </CardContent>
                </Card>
              ) : (
                videos.map((video) => (
                  <Card key={video.id} className="border-border/50 overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {video.thumbnail_url && (
                        <div className="sm:w-40 h-24 sm:h-auto bg-muted flex-shrink-0">
                          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-4 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{video.title}</h4>
                          {video.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{video.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(video.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteVideo(video)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
