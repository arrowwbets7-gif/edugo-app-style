import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";

interface CreatePostFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const CreatePostForm = ({ onCreated, onCancel }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("announcement");
  const [classFilter, setClassFilter] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        type: type as any,
        class_filter: classFilter.trim(),
        subject: subject.trim(),
      });
      if (error) throw error;
      toast.success("Post created!");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-accent" /> Create Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="discussion">💬 Discussion</SelectItem>
                <SelectItem value="note">📝 Study Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea placeholder="Write your post..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} required maxLength={5000} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Class (optional)</Label>
              <Input placeholder="e.g. Class 10" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label>Subject (optional)</Label>
              <Input placeholder="e.g. Math" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={50} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4 mr-2" /> Create Post</>}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
