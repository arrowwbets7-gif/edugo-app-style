import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Loader2, Trash2, Calendar, CheckCircle2, Clock, Send } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  class_filter: string;
  due_date: string | null;
  attachment_url: string | null;
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  content: string;
  grade: number | null;
  teacher_feedback: string | null;
  submitted_at: string;
}

interface Props {
  isTeacher?: boolean;
}

const AssignmentsSection = ({ isTeacher = false }: Props) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchAssignments();
    if (!isTeacher && user) fetchMySubmissions();
  }, []);

  const fetchAssignments = async () => {
    const { data } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
    if (data) setAssignments(data as Assignment[]);
  };

  const fetchMySubmissions = async () => {
    if (!user) return;
    const { data } = await supabase.from("assignment_submissions").select("*").eq("student_id", user.id);
    if (data) {
      const map: Record<string, Submission> = {};
      data.forEach((s) => { map[s.assignment_id] = s as Submission; });
      setSubmissions(map);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("assignments").insert({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        class_filter: classFilter.trim(),
        due_date: dueDate || null,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success("Assignment created!");
      setTitle(""); setDescription(""); setSubject(""); setClassFilter(""); setDueDate("");
      setShowCreate(false);
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const submitAnswer = async (assignmentId: string) => {
    if (!answerText.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      content: answerText.trim(),
    });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Already submitted" : "Failed to submit");
    } else {
      toast.success("Submitted!");
      setAnswerText("");
      setExpandedId(null);
      fetchMySubmissions();
    }
    setSaving(false);
  };

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchAssignments(); }
  };

  const isOverdue = (d: string | null) => d ? new Date(d) < new Date() : false;

  return (
    <div className="space-y-3">
      {isTeacher && !showCreate && (
        <Button onClick={() => setShowCreate(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Assignment
        </Button>
      )}

      {showCreate && (
        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" /> Create Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAssignment} className="space-y-3">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Assignment title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Instructions..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="e.g. Math" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-6 text-center text-muted-foreground">No assignments yet</CardContent>
        </Card>
      ) : (
        assignments.map((a) => {
          const sub = submissions[a.id];
          const overdue = isOverdue(a.due_date);
          return (
            <Card key={a.id} className="border-border/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                        <BookOpen className="w-3 h-3 mr-1" /> Assignment
                      </Badge>
                      {a.subject && <Badge variant="outline" className="text-xs">{a.subject}</Badge>}
                      {a.due_date && (
                        <Badge variant={overdue ? "destructive" : "secondary"} className="text-xs gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(a.due_date).toLocaleDateString()}
                        </Badge>
                      )}
                      {sub && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {sub.grade !== null ? `${sub.grade} marks` : "Submitted"}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold">{a.title}</h4>
                    {a.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>}
                    {sub?.teacher_feedback && (
                      <p className="text-sm text-primary mt-1 italic">Feedback: {sub.teacher_feedback}</p>
                    )}
                  </div>
                  {isTeacher ? (
                    <Button variant="ghost" size="icon" onClick={() => deleteAssignment(a.id)} className="text-red-400 hover:text-red-600 h-8 w-8">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : !sub && (
                    <Button size="sm" variant="outline" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                      <Send className="w-3 h-3 mr-1" /> Answer
                    </Button>
                  )}
                </div>

                {expandedId === a.id && !sub && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <Textarea
                      placeholder="Write your answer..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      rows={3}
                      maxLength={5000}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => submitAnswer(a.id)} disabled={saving || !answerText.trim()} className="flex-1">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                        Submit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setExpandedId(null)}>Cancel</Button>
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

export default AssignmentsSection;
