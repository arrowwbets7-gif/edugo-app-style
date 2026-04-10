import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Radio, Plus, Loader2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import LiveStreamActiveView from "./LiveStreamActiveView";

interface LiveStream {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  status: string;
  subject: string;
  created_at: string;
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

interface LiveStreamSectionProps {
  isTeacher?: boolean;
}

const LiveStreamSection = ({ isTeacher = false }: LiveStreamSectionProps) => {
  const { user } = useAuth();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStreams(); }, []);

  const fetchStreams = async () => {
    const { data } = await supabase.from("live_streams").select("*").order("created_at", { ascending: false });
    if (data) {
      setStreams(data as LiveStream[]);
      const live = data.find((s: any) => s.status === "live");
      if (live && !activeStream) setActiveStream(live as LiveStream);
    }
  };

  const createStream = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(ytUrl);
    if (!ytId || !title.trim()) { toast.error("Valid title and YouTube Live URL required"); return; }
    setSaving(true);
    const { error } = await supabase.from("live_streams").insert({
      title: title.trim(), youtube_url: ytUrl.trim(), youtube_id: ytId,
      subject: subject.trim(), class_filter: classFilter.trim(), started_by: user!.id, status: "live",
    });
    if (error) toast.error("Failed to create stream");
    else {
      toast.success("Live stream started!");
      setTitle(""); setYtUrl(""); setSubject(""); setClassFilter(""); setShowCreate(false); fetchStreams();
    }
    setSaving(false);
  };

  const endStream = async (streamId: string) => {
    await supabase.from("live_streams").update({ status: "ended" }).eq("id", streamId);
    toast.success("Stream ended");
    setActiveStream(null);
    fetchStreams();
  };

  const deleteStream = async (streamId: string) => {
    const { error } = await supabase.from("live_streams").delete().eq("id", streamId);
    if (error) toast.error("Failed to delete");
    else { toast.success("Stream deleted"); if (activeStream?.id === streamId) setActiveStream(null); fetchStreams(); }
  };

  if (activeStream) {
    return (
      <LiveStreamActiveView
        stream={activeStream}
        isTeacher={isTeacher}
        onClose={() => setActiveStream(null)}
        onEndStream={endStream}
      />
    );
  }

  return (
    <div className="space-y-3">
      {isTeacher && !showCreate && (
        <Button onClick={() => setShowCreate(true)} size="sm" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
          <Plus className="w-4 h-4 mr-1" /> Start Live Class
        </Button>
      )}

      {showCreate && (
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-destructive" /> Start Live Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createStream} className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Title *</Label>
                <Input placeholder="Live class title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Subject</Label>
                <Input placeholder="e.g. Math" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={50} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Class / Board</Label>
                <Input placeholder="e.g. Class 10 CBSE" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} maxLength={50} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">YouTube Live URL *</Label>
                <Input placeholder="https://youtube.com/live/..." value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} required className="h-9" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} size="sm" className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Radio className="w-3 h-3 mr-1" />} Go Live
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {streams.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-6 text-center text-muted-foreground text-sm">No live classes yet</CardContent>
        </Card>
      ) : (
        streams.map((stream) => (
          <Card key={stream.id} className={`border-border/50 overflow-hidden ${stream.status === "live" ? "border-destructive/30" : ""}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveStream(stream)}>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {stream.status === "live" ? (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                        <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> LIVE
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Ended</Badge>
                    )}
                    {stream.subject && <Badge variant="outline" className="text-xs">{stream.subject}</Badge>}
                  </div>
                  <h4 className="font-semibold text-sm truncate">{stream.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(stream.created_at).toLocaleDateString()}</p>
                </div>
                {isTeacher && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {stream.status === "live" && (
                      <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); endStream(stream.id); }}>
                        End
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={(e) => { e.stopPropagation(); deleteStream(stream.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default LiveStreamSection;
