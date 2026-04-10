import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone, MessageSquare, BookOpen, Send, Trash2, ChevronDown, ChevronUp, User,
  FileText, ImageIcon, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type: "announcement" | "discussion" | "note";
  class_filter: string;
  subject: string;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const typeConfig = {
  announcement: { icon: Megaphone, label: "Announcement", color: "bg-primary/10 text-primary border-primary/20" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "bg-accent/10 text-accent border-accent/20" },
  note: { icon: BookOpen, label: "Note", color: "bg-green-500/10 text-green-600 border-green-500/20" },
};

const PostsSection = ({ isTeacher = false }: { isTeacher?: boolean }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data as Post[]);
  };

  const fetchReplies = async (postId: string) => {
    const { data } = await supabase.from("post_replies").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    if (data) {
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const unknownIds = userIds.filter((id) => !profiles[id]);
      if (unknownIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", unknownIds);
        if (profs) {
          const newProfiles = { ...profiles };
          profs.forEach((p) => { newProfiles[p.user_id] = p.full_name; });
          setProfiles(newProfiles);
        }
      }
      setReplies((prev) => ({ ...prev, [postId]: data }));
    }
  };

  const toggleExpand = (postId: string) => {
    if (expandedPost === postId) { setExpandedPost(null); }
    else { setExpandedPost(postId); if (!replies[postId]) fetchReplies(postId); }
  };

  const sendReply = async (postId: string) => {
    const text = replyText[postId]?.trim();
    if (!text || !user) return;
    const { error } = await supabase.from("post_replies").insert({ post_id: postId, user_id: user.id, content: text });
    if (error) { toast.error("Failed to send reply"); return; }
    setReplyText((prev) => ({ ...prev, [postId]: "" }));
    fetchReplies(postId);
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) toast.error("Failed to delete post");
    else { toast.success("Post deleted"); fetchPosts(); }
  };

  return (
    <div className="space-y-3">
      {posts.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-6 text-center text-muted-foreground">No posts yet</CardContent>
        </Card>
      ) : (
        posts.map((post) => {
          const config = typeConfig[post.type];
          const Icon = config.icon;
          const isExpanded = expandedPost === post.id;
          const postReplies = replies[post.id] || [];

          return (
            <Card key={post.id} className="border-border/50 overflow-hidden">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${config.color} text-xs`}>
                      <Icon className="w-3 h-3 mr-1" /> {config.label}
                    </Badge>
                    {post.subject && <Badge variant="outline" className="text-xs">{post.subject}</Badge>}
                    {post.class_filter && <Badge variant="secondary" className="text-xs">{post.class_filter}</Badge>}
                  </div>
                  {isTeacher && (
                    <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="text-red-400 hover:text-red-600 h-8 w-8">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <h4 className="font-semibold mb-1">{post.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>

                {/* Attachment */}
                {post.attachment_url && (
                  <div className="mt-3">
                    {post.attachment_type === "image" ? (
                      <img src={post.attachment_url} alt="Attachment" className="rounded-lg max-h-60 w-auto border border-border/50" />
                    ) : (
                      <a href={post.attachment_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                        <FileText className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium flex-1">View PDF</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                  {post.type === "discussion" && (
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(post.id)} className="text-xs h-7 gap-1">
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Replies
                    </Button>
                  )}
                </div>

                {isExpanded && post.type === "discussion" && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    {postReplies.map((reply) => (
                      <div key={reply.id} className="flex gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-medium text-xs">{reply.user_id === user?.id ? "You" : (profiles[reply.user_id] || "Unknown")}</span>
                          <p className="text-muted-foreground">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Write a reply..."
                        value={replyText[post.id] || ""}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && sendReply(post.id)}
                      />
                      <Button size="icon" className="h-8 w-8" onClick={() => sendReply(post.id)}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default PostsSection;
