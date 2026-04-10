import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

interface RankEntry {
  name: string;
  score: number;
  total: number;
}

interface LiveQuizRankingProps {
  rankings: RankEntry[];
  quizTitle: string;
}

const podiumColors = [
  { bg: "bg-yellow-400/20", border: "border-yellow-400/50", text: "text-yellow-600", label: "🥇 1st", ring: "ring-yellow-400/30" },
  { bg: "bg-gray-300/20", border: "border-gray-400/50", text: "text-gray-500", label: "🥈 2nd", ring: "ring-gray-400/30" },
  { bg: "bg-amber-700/20", border: "border-amber-700/50", text: "text-amber-700", label: "🥉 3rd", ring: "ring-amber-700/30" },
];

const LiveQuizRanking = ({ rankings, quizTitle }: LiveQuizRankingProps) => {
  if (rankings.length === 0) return null;

  const sorted = [...rankings].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <Card className="border-accent/30 bg-gradient-to-b from-accent/5 to-transparent overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="text-center mb-4">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
          <h3 className="font-bold text-sm">{quizTitle} — Rankings</h3>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 mb-4">
          {[1, 0, 2].map((idx) => {
            const entry = top3[idx];
            if (!entry) return <div key={idx} className="w-20" />;
            const style = podiumColors[idx];
            const height = idx === 0 ? "h-28" : idx === 1 ? "h-24" : "h-20";
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center mb-1 ring-2 ${style.ring}`}>
                  <span className="text-lg font-bold">{entry.name.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-[10px] font-semibold truncate max-w-[80px] text-center">{entry.name}</p>
                <p className={`text-xs font-bold ${style.text}`}>{entry.score}/{entry.total}</p>
                <div className={`w-20 ${height} ${style.bg} border ${style.border} rounded-t-lg mt-1 flex items-center justify-center`}>
                  <span className="text-sm font-bold">{style.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of rankings */}
        {rest.length > 0 && (
          <div className="space-y-1.5">
            {rest.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 text-sm">
                <span className="w-6 text-center font-bold text-muted-foreground">#{i + 4}</span>
                <span className="flex-1 truncate font-medium">{entry.name}</span>
                <span className="text-xs font-semibold text-muted-foreground">{entry.score}/{entry.total}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveQuizRanking;
