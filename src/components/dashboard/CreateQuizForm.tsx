import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, ClipboardCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
}

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

const emptyQuestion = (): Question => ({
  question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a", marks: 1,
});

const CreateQuizForm = ({ onCreated, onCancel }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [totalMarks, setTotalMarks] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (i: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    (updated[i] as any)[field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) { toast.error("Title is required"); return; }
    const validQs = questions.filter((q) => q.question_text.trim() && q.option_a.trim() && q.option_b.trim());
    if (validQs.length === 0) { toast.error("Add at least one question with 2+ options"); return; }
    
    setSaving(true);
    try {
      const computedTotal = validQs.reduce((sum, q) => sum + q.marks, 0);
      const { data: quiz, error } = await supabase
        .from("quizzes")
        .insert({
          title: title.trim(),
          description: description.trim(),
          subject: subject.trim(),
          class_filter: classFilter.trim(),
          total_marks: computedTotal,
          time_limit_minutes: timeLimit || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      const questionsData = validQs.map((q, i) => ({
        quiz_id: quiz.id,
        question_text: q.question_text.trim(),
        option_a: q.option_a.trim(),
        option_b: q.option_b.trim(),
        option_c: q.option_c.trim(),
        option_d: q.option_d.trim(),
        correct_option: q.correct_option,
        marks: q.marks,
        sort_order: i,
      }));
      const { error: qErr } = await supabase.from("quiz_questions").insert(questionsData);
      if (qErr) throw qErr;

      toast.success("Quiz created!");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-accent" /> Create Quiz / Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Brief instructions..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="e.g. Math" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Input placeholder="e.g. Class 10" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} maxLength={50} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time Limit (minutes, optional)</Label>
            <Input type="number" placeholder="No limit" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : "")} min={1} max={180} />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Questions</Label>
            {questions.map((q, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-3 pb-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Q{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", parseInt(e.target.value) || 1)} className="w-16 h-7 text-xs" min={1} max={10} />
                      <span className="text-xs text-muted-foreground">marks</span>
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => removeQuestion(i)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea placeholder="Question text" value={q.question_text} onChange={(e) => updateQuestion(i, "question_text", e.target.value)} rows={2} maxLength={500} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Option A" value={q.option_a} onChange={(e) => updateQuestion(i, "option_a", e.target.value)} maxLength={200} />
                    <Input placeholder="Option B" value={q.option_b} onChange={(e) => updateQuestion(i, "option_b", e.target.value)} maxLength={200} />
                    <Input placeholder="Option C" value={q.option_c} onChange={(e) => updateQuestion(i, "option_c", e.target.value)} maxLength={200} />
                    <Input placeholder="Option D" value={q.option_d} onChange={(e) => updateQuestion(i, "option_d", e.target.value)} maxLength={200} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Correct Answer</Label>
                    <Select value={q.correct_option} onValueChange={(v) => updateQuestion(i, "correct_option", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">Option A</SelectItem>
                        <SelectItem value="b">Option B</SelectItem>
                        <SelectItem value="c">Option C</SelectItem>
                        <SelectItem value="d">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="w-full">
              <Plus className="w-3 h-3 mr-1" /> Add Question
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Quiz
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateQuizForm;
