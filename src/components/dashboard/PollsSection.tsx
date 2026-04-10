import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PollCard from "./PollCard";
import { Card, CardContent } from "@/components/ui/card";

interface Poll {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  isTeacher?: boolean;
}

const PollsSection = ({ isTeacher = false }: Props) => {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    const { data } = await supabase.from("polls").select("*").eq("is_active", true).order("created_at", { ascending: false });
    if (data) setPolls(data);
  };

  if (polls.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6 text-center text-muted-foreground">No polls yet</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} isTeacher={isTeacher} onDelete={fetchPolls} />
      ))}
    </div>
  );
};

export default PollsSection;
