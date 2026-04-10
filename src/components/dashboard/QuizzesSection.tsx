import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Trash2, Users, Award } from "lucide-react";
import { toast } from "sonner";
import QuizAttempt from "./QuizAttempt";

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  class_filter: string;
  total_marks: number;
  time_limit_minutes: number | null;
  is_active: boolean;
  created_at: string;
}

interface Props {
  isTeacher?: boolean;
}

const QuizzesSection = ({ isTeacher = false }: Props) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<Record<string, { score: number; total: number }>>({});

  useEffect(() => {
    fetchQuizzes();
    if (!isTeacher && user) fetchMyAttempts();
  }, []);

  const fetchQuizzes = async () => {
    const { data } = await supabase.from("quizzes").select("*").eq("is_active", true).order("created_at", { ascending: false });
    if (data) setQuizzes(data as Quiz[]);
  };

  const fetchMyAttempts = async () => {
    if (!user) return;
    const { data } = await supabase.from("quiz_attempts").select("quiz_id, score, total_marks").eq("student_id", user.id);
    if (data) {
      const map: Record<string, { score: number; total: number }> = {};
      data.forEach((a) => { map[a.quiz_id] = { score: a.score, total: a.total_marks }; });
      setAttempts(map);
    }
  };

  const deleteQuiz = async (id: string) => {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) toast.error("Failed to delete quiz");
    else { toast.success("Quiz deleted"); fetchQuizzes(); }
  };

  const toggleQuiz = async (id: string, active: boolean) => {
    await supabase.from("quizzes").update({ is_active: !active }).eq("id", id);
    fetchQuizzes();
  };

  if (activeQuiz) {
    return <QuizAttempt quiz={activeQuiz} onBack={() => { setActiveQuiz(null); fetchMyAttempts(); }} />;
  }

  return (
    <div className="space-y-3">
      {quizzes.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-6 text-center text-muted-foreground">No quizzes available</CardContent>
        </Card>
      ) : (
        quizzes.map((quiz) => {
          const attempt = attempts[quiz.id];
          return (
            <Card key={quiz.id} className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => !isTeacher && setActiveQuiz(quiz)}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                        <ClipboardCheck className="w-3 h-3 mr-1" /> Quiz
                      </Badge>
                      {quiz.subject && <Badge variant="outline" className="text-xs">{quiz.subject}</Badge>}
                      {quiz.class_filter && <Badge variant="secondary" className="text-xs">{quiz.class_filter}</Badge>}
                      <Badge variant="outline" className="text-xs">{quiz.total_marks} marks</Badge>
                      {quiz.time_limit_minutes && <Badge variant="outline" className="text-xs">{quiz.time_limit_minutes} min</Badge>}
                    </div>
                    <h4 className="font-semibold">{quiz.title}</h4>
                    {quiz.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{quiz.description}</p>}
                    {attempt && (
                      <div className="flex items-center gap-1 mt-2">
                        <Award className={`w-4 h-4 ${attempt.score >= attempt.total * 0.6 ? "text-green-500" : "text-amber-500"}`} />
                        <span className="text-sm font-medium">{attempt.score}/{attempt.total}</span>
                        <span className="text-xs text-muted-foreground">completed</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(quiz.created_at).toLocaleDateString()}</p>
                  </div>
                  {isTeacher && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteQuiz(quiz.id); }} className="text-red-400 hover:text-red-600 h-8 w-8">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default QuizzesSection;
