import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Camera, Loader2, User, Save } from "lucide-react";
import { toast } from "sonner";

const ProfileSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = (profile as any)?.avatar_url;
  const initials = (profile?.full_name || "U").slice(0, 2).toUpperCase();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);

    await refreshProfile();
    toast.success("Avatar updated!");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user || !fullName.trim()) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("user_id", user.id);
    await refreshProfile();
    toast.success("Profile updated!");
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex-shrink-0 focus:outline-none">
          <Avatar className="w-11 h-11 ring-2 ring-accent/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-accent/10 text-accent text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[2rem] max-h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base font-bold">Edit Profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-accent/10 text-accent text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">Tap camera to change photo</p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl bg-secondary/50 border-border/30"
              maxLength={100}
            />
          </div>

          {/* Read-only fields */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </Label>
            <Input
              value={profile?.email || ""}
              disabled
              className="h-11 rounded-xl bg-secondary/30 border-border/20 text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Class
            </Label>
            <Input
              value={profile?.class || ""}
              disabled
              className="h-11 rounded-xl bg-secondary/30 border-border/20 text-muted-foreground"
            />
          </div>

          <Button
            className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleSave}
            disabled={saving || !fullName.trim()}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSettings;
