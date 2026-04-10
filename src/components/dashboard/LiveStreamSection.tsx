import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Radio, Send, Pin, Trash2, Plus, Loader2, X, Users, Eye
} from "lucide-react";
import { toast } from "sonner";

interface LiveStream {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  status: string;
  subject: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  is_pinned: boolean;
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
  const { user, role } = useAuth();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchStreams(); }, []);

  useEffect(() => {
    if (!activeStream) return;
    fetchChat(activeStream.id);
    recordAttendance(activeStream.id);
    fetchAttendanceCount(activeStream.id);

    const channel = supabase
      .channel(`live-chat-${activeStream.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "live_chat_messages",
        filter: `stream_id=eq.${activeStream.id}`,
      }, () => fetchChat(activeStream.id))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeStream?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchStreams = async () => {
    const { data } = await supabase.from("live_streams").select("*").order("created_at", { ascending: false });
    if (data) {
      setStreams(data as LiveStream[]);
      const live = data.find((s: any) => s.status === "live");
      if (live && !activeStream) setActiveStream(live as LiveStream);
    }
  };

  const fetchChat = async (streamId: string) => {
    const { data } = await supabase.from("live_chat_messages").select("*").eq("stream_id", streamId).order("created_at", { ascending: true }).limit(200);
    if (data) {
      setChatMessages(data as ChatMessage[]);
      const userIds = [...new Set(data.map((m: any) => m.user_id))];
      const unknownIds = userIds.filter((id) => !profiles[id]);
      if (unknownIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", unknownIds);
        if (profs) {
          const newP = { ...profiles };
          profs.forEach((p: any) => { newP[p.user_id] = p.full_name; });
          setProfiles(newP);
        }
      }
    }
  };

  const recordAttendance = async (streamId: string) => {
    if (!user) return;
    await supabase.from("attendance").upsert({
      stream_id: streamId,
      student_id: user.id,
    }, { onConflict: "stream_id,student_id" });
  };

  const fetchAttendanceCount = async (streamId: string) => {
    const { count } = await supabase.from("attendance").select("*", { count: "exact", head: true }).eq("stream_id", streamId);
    setAttendanceCount(count || 0);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeStream) return;
    const { error } = await supabase.from("live_chat_messages").insert({
      stream_id: activeStream.id, user_id: user.id, message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    setNewMessage("");
  };

  const pinMessage = async (msgId: string, pinned: boolean) => {
    await supabase.from("live_chat_messages").update({ is_pinned: !pinned }).eq("id", msgId);
    fetchChat(activeStream!.id);
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from("live_chat_messages").delete().eq("id", msgId);
  };

  const createStream = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(ytUrl);
    if (!ytId || !title.trim()) { toast.error("Valid title and YouTube Live URL required"); return; }
    setSaving(true);
    const { error } = await supabase.from("live_streams").insert({
      title: title.trim(), youtube_url: ytUrl.trim(), youtube_id: ytId,
      subject: subject.trim(), started_by: user!.id, status: "live",
    });
    if (error) toast.error("Failed to create stream");
    else {
      toast.success("Live stream started!");
      setTitle(""); setYtUrl(""); setSubject(""); setShowCreate(false); fetchStreams();
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

  const pinnedMessages = chatMessages.filter((m) => m.is_pinned);

  if (activeStream) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs flex-shrink-0">
              <Radio className="w-3 h-3 mr-1 animate-pulse" /> {activeStream.status === "live" ? "LIVE" : "ENDED"}
            </Badge>
            <h3 className="font-semibold text-sm truncate">{activeStream.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs gap-1">
              <Eye className="w-3 h-3" /> {attendanceCount}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveStream(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black" onContextMenu={(e) => e.preventDefault()}>
          <iframe
            src={`https://www.youtube.com/embed/${activeStream.youtube_id}?autoplay=1&modestbranding=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>

        {pinnedMessages.length > 0 && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="py-2 px-3">
              {pinnedMessages.map((m) => (
                <div key={m.id} className="flex items-start gap-2 text-sm">
                  <Pin className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-xs">{profiles[m.user_id] || "Unknown"}: </span>
                    <span className="text-muted-foreground break-words">{m.message}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardHeader className="py-2 px-3 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" /> Live Chat
            </div>
          </CardHeader>
          <ScrollArea className="h-48">
            <div className="p-2 space-y-1.5">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-1.5 text-sm group ${msg.is_pinned ? "bg-accent/5 -mx-1 px-1 rounded" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-xs text-primary">
                      {msg.user_id === user?.id ? "You" : (profiles[msg.user_id] || "User")}
                    </span>
                    <span className="text-muted-foreground ml-1 text-xs break-words">{msg.message}</span>
                  </div>
                  {isTeacher && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => pinMessage(msg.id, msg.is_pinned)}>
                        <Pin className={`w-2.5 h-2.5 ${msg.is_pinned ? "text-accent" : "text-muted-foreground"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400" onClick={() => deleteMessage(msg.id)}>
                        <Trash2 className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="p-2 border-t border-border/50 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="h-8 text-sm"
            />
            <Button size="icon" className="h-8 w-8" onClick={sendMessage}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>

        {isTeacher && activeStream.status === "live" && (
          <Button variant="destructive" size="sm" className="w-full" onClick={() => endStream(activeStream.id)}>
            End Stream
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isTeacher && !showCreate && (
        <Button onClick={() => setShowCreate(true)} size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Start Live Class
        </Button>
      )}

      {showCreate && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" /> Start Live Class
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
                <Label className="text-xs">YouTube Live URL *</Label>
                <Input placeholder="https://youtube.com/live/..." value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} required className="h-9" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white">
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
          <Card key={stream.id} className={`border-border/50 overflow-hidden ${stream.status === "live" ? "border-red-500/30" : ""}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveStream(stream)}>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {stream.status === "live" ? (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteStream(stream.id); }}>
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
