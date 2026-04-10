import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, BarChart3, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

const CreatePollForm = ({ onCreated, onCancel }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!title.trim() || validOptions.length < 2 || !user) {
      toast.error("Title and at least 2 options required");
      return;
    }
    setSaving(true);
    try {
      const { data: poll, error: pollErr } = await supabase
        .from("polls")
        .insert({ title: title.trim(), created_by: user.id })
        .select()
        .single();
      if (pollErr) throw pollErr;

      const optionsData = validOptions.map((text) => ({
        poll_id: poll.id,
        option_text: text.trim(),
      }));
      const { error: optErr } = await supabase.from("poll_options").insert(optionsData);
      if (optErr) throw optErr;

      toast.success("Poll created!");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create poll");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" /> Create Poll
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Question *</Label>
            <Input placeholder="What do you want to ask?" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={300} />
          </div>
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                  maxLength={200}
                />
                {options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 text-red-400" onClick={() => removeOption(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full">
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Poll
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePollForm;
