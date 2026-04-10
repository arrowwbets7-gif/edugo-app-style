import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
}

interface Poll {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  poll: Poll;
  isTeacher?: boolean;
  onDelete?: () => void;
}

const PollCard = ({ poll, isTeacher, onDelete }: Props) => {
  const { user } = useAuth();
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
    if (user) checkUserVote();
  }, [poll.id, user]);

  const fetchOptions = async () => {
    const { data } = await supabase.from("poll_options").select("*").eq("poll_id", poll.id).order("created_at");
    if (data) setOptions(data);
  };

  const checkUserVote = async () => {
    if (!user) return;
    const { data } = await supabase.from("poll_votes").select("option_id").eq("poll_id", poll.id).eq("user_id", user.id).maybeSingle();
    if (data) setUserVote(data.option_id);
  };

  const vote = async (optionId: string) => {
    if (!user || userVote || loading) return;
    setLoading(true);
    const { error } = await supabase.from("poll_votes").insert({ poll_id: poll.id, option_id: optionId, user_id: user.id });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "You already voted" : "Failed to vote");
    } else {
      setUserVote(optionId);
      fetchOptions();
    }
    setLoading(false);
  };

  const deletePoll = async () => {
    const { error } = await supabase.from("polls").delete().eq("id", poll.id);
    if (error) toast.error("Failed to delete poll");
    else { toast.success("Poll deleted"); onDelete?.(); }
  };

  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);
  const hasVoted = !!userVote;

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
              <BarChart3 className="w-3 h-3 mr-1" /> Poll
            </Badge>
          </div>
          {isTeacher && (
            <Button variant="ghost" size="icon" onClick={deletePoll} className="text-red-400 hover:text-red-600 h-8 w-8">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <h4 className="font-semibold mb-3">{poll.title}</h4>
        <div className="space-y-2">
          {options.map((opt) => {
            const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
            const isSelected = userVote === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => !hasVoted && vote(opt.id)}
                disabled={hasVoted || loading}
                className={`w-full text-left relative rounded-lg border p-3 transition-all ${
                  isSelected ? "border-primary bg-primary/5" : hasVoted ? "border-border/50" : "border-border hover:border-primary/50 cursor-pointer"
                }`}
              >
                {hasVoted && (
                  <div className="absolute inset-0 rounded-lg bg-primary/10 transition-all" style={{ width: `${pct}%` }} />
                )}
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-medium">{opt.option_text}</span>
                  {hasVoted && <span className="text-xs text-muted-foreground font-mono">{pct}%</span>}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""} • {new Date(poll.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default PollCard;
