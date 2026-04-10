import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Copy, CheckCircle2, Clock, LogOut, Home, Play, GraduationCap, ShieldCheck, User, X
} from "lucide-react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
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
  const { user, profile, role, signOut, refreshProfile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [copied, setCopied] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.is_verified) fetchVideos();
  }, [profile?.is_verified]);

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setVideos(data);
  };

  const copyCode = () => {
    if (profile?.verification_code) {
      navigator.clipboard.writeText(profile.verification_code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fullscreen Video Player Overlay */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onContextMenu={(e) => e.preventDefault()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPlayingVideo(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="w-full max-w-4xl aspect-video relative">
            {/* Invisible overlay to block right-click on iframe */}
            <div
              className="absolute inset-0 z-10"
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: "none" }}
            />
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1&rel=0&modestbranding=1&disablekb=0`}
              title="Video Player"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full rounded-xl"
              style={{ border: "none" }}
            />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-lg border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-extrabold font-heading text-primary-foreground">
            EduGo<span className="text-accent">Classes</span>
          </Link>
          <div className="flex items-center gap-3">
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

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{profile?.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{profile?.class || "No class set"}</span>
            </div>
            <div className="flex items-center gap-2">
              {profile?.is_verified ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <Clock className="w-3 h-3 mr-1" /> Pending Verification
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Code */}
        {!profile?.is_verified && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">Your Verification Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this code with your teacher to get verified and access all video lessons
                </p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-3xl font-mono font-bold tracking-[0.3em] bg-card px-6 py-3 rounded-xl border">
                    {profile?.verification_code}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={refreshProfile}>
                Check Verification Status
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Videos */}
        {profile?.is_verified ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-accent" /> Video Lessons
            </h2>
            {videos.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No videos available yet. Check back soon!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {videos.map((video) => {
                  const ytId = extractYouTubeId(video.video_url);
                  const thumb = ytId
                    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                    : video.thumbnail_url;

                  return (
                    <Card
                      key={video.id}
                      className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => ytId && setPlayingVideo(ytId)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <div className="relative">
                        {thumb && (
                          <div className="relative w-full aspect-video bg-muted">
                            <img
                              src={thumb}
                              alt={video.title}
                              className="w-full h-full object-cover select-none pointer-events-none"
                              draggable={false}
                            />
                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                <Play className="w-7 h-7 text-white ml-1" fill="white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold mb-1">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(video.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <Play className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Video lessons will be available after your teacher verifies your account
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
