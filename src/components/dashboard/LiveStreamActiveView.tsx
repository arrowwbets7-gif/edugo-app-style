import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

const loadYTApi = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) {
      const check = setInterval(() => { if (window.YT?.Player) { clearInterval(check); resolve(); } }, 100);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const first = document.getElementsByTagName("script")[0];
    first.parentNode?.insertBefore(tag, first);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Radio, Send, Pin, Trash2, X, Users, Eye, Maximize, Minimize,
  BarChart3, ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";
import CreatePollForm from "./CreatePollForm";
import CreateQuizForm from "./CreateQuizForm";
import PollCard from "./PollCard";
import QuizAttempt from "./QuizAttempt";
import LiveQuizRanking from "./LiveQuizRanking";

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

interface Props {
  stream: LiveStream;
  isTeacher: boolean;
  onClose: () => void;
  onEndStream: (id: string) => void;
}

const LiveStreamActiveView = ({ stream, isTeacher, onClose, onEndStream }: Props) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLivePoll, setShowLivePoll] = useState(false);
  const [showLiveQuiz, setShowLiveQuiz] = useState(false);
  const [livePolls, setLivePolls] = useState<any[]>([]);
  const [liveQuizzes, setLiveQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [rankings, setRankings] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const playerContainerId = `live-yt-player-${stream.id}`;

  // Initialize YT API player (same approach as CustomVideoPlayer)
  useEffect(() => {
    let mounted = true;
    loadYTApi().then(() => {
      if (!mounted) return;
      playerRef.current = new window.YT.Player(playerContainerId, {
        videoId: stream.youtube_id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => { e.target.playVideo(); },
        },
      });
    });
    return () => { mounted = false; playerRef.current?.destroy(); };
  }, [stream.youtube_id]);

  useEffect(() => {
    fetchChat(stream.id);
    recordAttendance(stream.id);
    fetchAttendanceCount(stream.id);
    fetchLivePolls();
    fetchLiveQuizzes();

    return () => { supabase.removeChannel(channel); };
  }, [stream.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
      stream_id: streamId, student_id: user.id,
    }, { onConflict: "stream_id,student_id" });
  };

  const fetchAttendanceCount = async (streamId: string) => {
    const { count } = await supabase.from("attendance").select("*", { count: "exact", head: true }).eq("stream_id", streamId);
    setAttendanceCount(count || 0);
  };

  const fetchLivePolls = async () => {
    const { data } = await supabase.from("polls").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(5);
    if (data) setLivePolls(data);
  };

  const fetchLiveQuizzes = async () => {
    const { data } = await supabase.from("quizzes").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(5);
    if (data) setLiveQuizzes(data);
  };

  const fetchRankings = async (quizId: string) => {
    const { data: attempts } = await supabase.from("quiz_attempts").select("*").eq("quiz_id", quizId).order("score", { ascending: false });
    if (attempts && attempts.length > 0) {
      const userIds = attempts.map((a: any) => a.student_id);
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      profs?.forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
      setRankings(attempts.map((a: any) => ({
        name: nameMap[a.student_id] || "Student",
        score: a.score,
        total: a.total_marks,
      })));
      setShowRanking(true);
    } else {
      toast.info("No attempts yet");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !stream) return;
    const { error } = await supabase.from("live_chat_messages").insert({
      stream_id: stream.id, user_id: user.id, message: newMessage.trim(),
    });
    if (error) toast.error("Failed to send");
    setNewMessage("");
  };

  const pinMessage = async (msgId: string, pinned: boolean) => {
    await supabase.from("live_chat_messages").update({ is_pinned: !pinned }).eq("id", msgId);
    fetchChat(stream.id);
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from("live_chat_messages").delete().eq("id", msgId);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const pinnedMessages = chatMessages.filter((m) => m.is_pinned);

  if (activeQuiz) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setActiveQuiz(null)} className="mb-2">
          <X className="w-4 h-4 mr-1" /> Back to Stream
        </Button>
        <QuizAttempt
          quiz={activeQuiz}
          onBack={() => { setActiveQuiz(null); toast.success("Quiz submitted!"); }}
        />
      </div>
    );
  }

  if (showRanking) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setShowRanking(false)} className="mb-2">
          <X className="w-4 h-4 mr-1" /> Back to Stream
        </Button>
        <LiveQuizRanking rankings={rankings} quizTitle="Live Quiz" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`space-y-3 ${isFullscreen ? "bg-background p-4 overflow-auto" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs flex-shrink-0">
            <Radio className="w-3 h-3 mr-1 animate-pulse" /> {stream.status === "live" ? "LIVE" : "ENDED"}
          </Badge>
          <h3 className="font-semibold text-sm truncate">{stream.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs gap-1">
            <Eye className="w-3 h-3" /> {attendanceCount}
          </Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video */}
      <div
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-black select-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${stream.youtube_id}?autoplay=1&modestbranding=1&rel=0&controls=0&disablekb=1&fs=0&iv_load_policy=3&showinfo=0&cc_load_policy=0&origin=${encodeURIComponent(window.location.origin)}`}
          className="w-full h-full pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          referrerPolicy="no-referrer"
          style={{ border: 'none' }}
        />
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <div className="absolute inset-0 z-20" />
      </div>

      {/* Teacher: Live Poll / Quiz controls - always visible buttons */}
      {isTeacher && stream.status === "live" && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className={`text-xs ${showLivePoll ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
            onClick={() => { setShowLivePoll(!showLivePoll); setShowLiveQuiz(false); }}
          >
            <BarChart3 className="w-4 h-4 mr-1" /> {showLivePoll ? "Cancel Poll" : "Launch Poll"}
          </Button>
          <Button
            size="sm"
            className={`text-xs ${showLiveQuiz ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
            onClick={() => { setShowLiveQuiz(!showLiveQuiz); setShowLivePoll(false); }}
          >
            <ClipboardCheck className="w-4 h-4 mr-1" /> {showLiveQuiz ? "Cancel Quiz" : "Launch Quiz"}
          </Button>
        </div>
      )}

      {/* Live Poll creation */}
      {showLivePoll && isTeacher && (
        <CreatePollForm onCreated={() => { setShowLivePoll(false); fetchLivePolls(); }} onCancel={() => setShowLivePoll(false)} />
      )}

      {/* Live Quiz creation */}
      {showLiveQuiz && isTeacher && (
        <CreateQuizForm onCreated={() => { setShowLiveQuiz(false); fetchLiveQuizzes(); }} onCancel={() => setShowLiveQuiz(false)} />
      )}

      {/* Active polls in stream */}
      {livePolls.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Live Polls
          </p>
          {livePolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} isTeacher={isTeacher} onDelete={fetchLivePolls} />
          ))}
        </div>
      )}

      {/* Active quizzes in stream */}
      {liveQuizzes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <ClipboardCheck className="w-3 h-3" /> Live Quizzes
          </p>
          {liveQuizzes.map((quiz) => (
            <Card key={quiz.id} className="border-accent/20">
              <CardContent className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold truncate">{quiz.title}</h4>
                  <p className="text-xs text-muted-foreground">{quiz.total_marks} marks{quiz.time_limit_minutes ? ` • ${quiz.time_limit_minutes} min` : ""}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!isTeacher && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => setActiveQuiz(quiz)}>
                      Attempt
                    </Button>
                  )}
                  {isTeacher && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => fetchRankings(quiz.id)}>
                      Rankings
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pinned messages */}
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

      {/* Chat */}
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
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => deleteMessage(msg.id)}>
                      <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Simple chat input */}
        <div className="p-2 border-t border-border/50">
          <div className="flex gap-2">
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
        </div>
      </Card>

      {/* End stream button */}
      {isTeacher && stream.status === "live" && (
        <Button variant="destructive" size="sm" className="w-full" onClick={() => onEndStream(stream.id)}>
          End Stream
        </Button>
      )}
    </div>
  );
};

export default LiveStreamActiveView;
