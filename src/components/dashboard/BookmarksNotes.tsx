import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bookmark, BookmarkCheck, StickyNote, Save, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface VideoBookmarkProps {
  videoId: string;
  videoTitle: string;
}

// Inline bookmark button for video cards
export const BookmarkButton = ({ videoId }: { videoId: string }) => {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle()
      .then(({ data }) => setBookmarked(!!data));
  }, [user, videoId]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("video_id", videoId);
      setBookmarked(false);
      toast.success("Removed from saved");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, video_id: videoId });
      setBookmarked(true);
      toast.success("Saved!");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-accent" />
      ) : (
        <Bookmark className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
};

// Notes sheet for a video
export const VideoNotes = ({ videoId, videoTitle }: VideoBookmarkProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("student_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNote((data as any).content || "");
          setNoteId((data as any).id);
          setHasNote(true);
        }
      });
  }, [user, videoId, open]);

  // Check if note exists for icon state
  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_notes")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle()
      .then(({ data }) => setHasNote(!!data));
  }, [user, videoId]);

  const saveNote = async () => {
    if (!user) return;
    setSaving(true);
    if (noteId) {
      await supabase.from("student_notes").update({ content: note }).eq("id", noteId);
    } else {
      const { data } = await supabase
        .from("student_notes")
        .insert({ user_id: user.id, video_id: videoId, content: note })
        .select("id")
        .single();
      if (data) setNoteId(data.id);
    }
    setHasNote(true);
    toast.success("Notes saved!");
    setSaving(false);
  };

  const deleteNote = async () => {
    if (!noteId) return;
    await supabase.from("student_notes").delete().eq("id", noteId);
    setNote("");
    setNoteId(null);
    setHasNote(false);
    toast.success("Note deleted");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
      >
        <StickyNote className={`w-4 h-4 ${hasNote ? "text-accent" : "text-muted-foreground"}`} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-[2rem] max-h-[70vh]">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-sm font-bold truncate pr-8">
              Notes: {videoTitle}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-3 pb-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes here... Key formulas, important points, doubts to clarify..."
              className="min-h-[150px] rounded-xl bg-secondary/50 border-border/30 text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 h-10 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={saveNote}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
              {noteId && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-destructive"
                  onClick={deleteNote}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// Saved videos tab content
interface SavedVideo {
  id: string;
  title: string;
  video_url: string;
  subject: string;
  thumbnail_url: string | null;
}

export const SavedVideosTab = ({ onPlayVideo }: { onPlayVideo: (id: string, title: string) => void }) => {
  const { user } = useAuth();
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    if (!user) return;
    setLoading(true);
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("video_id")
      .eq("user_id", user.id);

    if (bookmarks && bookmarks.length > 0) {
      const videoIds = bookmarks.map((b: any) => b.video_id);
      const { data: videos } = await supabase
        .from("videos")
        .select("id, title, video_url, subject, thumbnail_url")
        .in("id", videoIds);
      if (videos) setSavedVideos(videos as SavedVideo[]);
    } else {
      setSavedVideos([]);
    }
    setLoading(false);
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (savedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No saved videos yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Tap the bookmark icon on any video to save it</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {savedVideos.map((video) => {
        const ytId = extractYouTubeId(video.video_url);
        return (
          <Card
            key={video.id}
            className="border-0 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => ytId && onPlayVideo(ytId, video.title)}
          >
            <CardContent className="p-2.5 flex items-center gap-3">
              <div className="w-20 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {ytId && (
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{video.title}</p>
                {video.subject && <p className="text-[10px] text-muted-foreground">{video.subject}</p>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
