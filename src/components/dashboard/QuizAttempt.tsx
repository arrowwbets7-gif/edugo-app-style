import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Clock, CheckCircle2, XCircle, ArrowLeft, Timer } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  sort_order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  total_marks: number;
  time_limit_minutes: number | null;
}

interface Props {
  quiz: Quiz;
  onBack: () => void;
}

const QuizAttempt = ({ quiz, onBack }: Props) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingAttempt, setExistingAttempt] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
    checkExistingAttempt();
    if (quiz.time_limit_minutes) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
  }, [quiz.id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("sort_order");
    if (data) setQuestions(data);
  };

  const checkExistingAttempt = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quiz.id)
      .eq("student_id", user.id)
      .maybeSingle();
    if (data) {
      setExistingAttempt(data);
      setSubmitted(true);
      setScore(data.score);
      setAnswers(data.answers as Record<string, string>);
    }
  };

  const handleSubmit = async () => {
    if (!user || submitted) return;
    setLoading(true);
    let totalScore = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_option) totalScore += q.marks;
    }
    
    const { error } = await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      student_id: user.id,
      score: totalScore,
      total_marks: quiz.total_marks,
      answers,
    });
    
    if (error) {
      toast.error(error.message.includes("duplicate") ? "You already attempted this quiz" : "Failed to submit");
    } else {
      setScore(totalScore);
      setSubmitted(true);
      toast.success(`Quiz submitted! Score: ${totalScore}/${quiz.total_marks}`);
    }
    setLoading(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        {timeLeft !== null && !submitted && (
          <Badge variant={timeLeft < 60 ? "destructive" : "secondary"} className="gap-1">
            <Timer className="w-3 h-3" /> {formatTime(timeLeft)}
          </Badge>
        )}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
          <div className="flex gap-2 mt-1">
            {quiz.subject && <Badge variant="outline" className="text-xs">{quiz.subject}</Badge>}
            <Badge variant="secondary" className="text-xs">Total: {quiz.total_marks} marks</Badge>
          </div>
        </CardHeader>
      </Card>

      {submitted && (
        <Card className={`border-2 ${score >= quiz.total_marks * 0.6 ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{score}/{quiz.total_marks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {score >= quiz.total_marks * 0.6 ? "Great job! 🎉" : "Keep practicing! 💪"}
            </p>
          </CardContent>
        </Card>
      )}

      {questions.map((q, i) => {
        const opts = [
          { key: "a", text: q.option_a },
          { key: "b", text: q.option_b },
          { key: "c", text: q.option_c },
          { key: "d", text: q.option_d },
        ].filter((o) => o.text.trim());

        return (
          <Card key={q.id} className="border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium text-sm">Q{i + 1}. {q.question_text}</p>
                <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">{q.marks}m</Badge>
              </div>
              <div className="space-y-2">
                {opts.map((opt) => {
                  const isSelected = answers[q.id] === opt.key;
                  const isCorrect = opt.key === q.correct_option;
                  let style = "border-border hover:border-primary/50";
                  if (submitted) {
                    if (isCorrect) style = "border-green-500 bg-green-500/10";
                    else if (isSelected && !isCorrect) style = "border-red-500 bg-red-500/10";
                    else style = "border-border/50 opacity-60";
                  } else if (isSelected) {
                    style = "border-primary bg-primary/10";
                  }
                  
                  return (
                    <button
                      key={opt.key}
                      onClick={() => !submitted && setAnswers({ ...answers, [q.id]: opt.key })}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-center gap-2 ${style}`}
                    >
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {opt.key.toUpperCase()}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {!submitted && questions.length > 0 && (
        <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
          {loading ? "Submitting..." : "Submit Quiz"}
        </Button>
      )}
    </div>
  );
};

export default QuizAttempt;
