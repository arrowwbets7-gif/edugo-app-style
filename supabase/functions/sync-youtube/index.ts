import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHANNEL_ID = "UCTifMgBVtQ-elGg3ap89zxA";
const CHANNEL_URL = "https://www.youtube.com/@edugoclasses/videos";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the teacher/admin user for uploaded_by
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["teacher", "admin"])
      .limit(1)
      .single();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "No teacher/admin found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the channel page to scrape video IDs
    const response = await fetch(CHANNEL_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch channel page: ${response.status}`);
    }

    const html = await response.text();

    // Extract video IDs from the page HTML
    const videoIdPattern = /\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g;
    const foundIds = new Set<string>();
    let match;
    while ((match = videoIdPattern.exec(html)) !== null) {
      foundIds.add(match[1]);
    }

    // Also extract titles if possible
    const titlePattern = /\"title\":\{\"runs\":\[\{\"text\":\"([^\"]+)\"\}/g;
    const titles: Record<string, string> = {};
    const titleMatches = [...html.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\".*?\"title\":\{\"runs\":\[\{\"text\":\"([^\"]+)\"\}/gs)];

    // Simple approach: extract video data from ytInitialData
    const videoData: Array<{ id: string; title: string }> = [];
    const simplePattern = /\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g;
    const allIds: string[] = [];
    let m;
    while ((m = simplePattern.exec(html)) !== null) {
      if (!allIds.includes(m[1])) allIds.push(m[1]);
    }

    // Get existing video URLs to avoid duplicates
    const { data: existingVideos } = await supabase
      .from("videos")
      .select("video_url");

    const existingIds = new Set(
      (existingVideos || []).map((v: any) => {
        const m = v.video_url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      }).filter(Boolean)
    );

    // Filter new videos
    const newIds = allIds.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) {
      // Also check ended live streams and move them to videos
      await moveEndedStreamsToVideos(supabase, adminRole.user_id);

      return new Response(JSON.stringify({ message: "No new videos found", synced: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Lovable AI to generate metadata for each new video
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let inserted = 0;

    for (const videoId of newIds.slice(0, 10)) { // max 10 at a time
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      let title = `Video ${videoId}`;
      let description = "";
      let subject = "General";

      if (LOVABLE_API_KEY) {
        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "user",
                  content: `Given YouTube video ID "${videoId}" from channel "EduGoClasses" (an Indian education channel), generate metadata. Return ONLY valid JSON: {"title":"...","description":"...","subject":"..."} where subject is one of: Math, Science, Physics, Chemistry, Biology, English, Hindi, Social Science, Computer Science, General`,
                },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "video_metadata",
                  description: "Return video metadata",
                  parameters: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      subject: { type: "string" },
                    },
                    required: ["title", "description", "subject"],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "video_metadata" } },
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall) {
              const args = JSON.parse(toolCall.function.arguments);
              title = args.title || title;
              description = args.description || "";
              subject = args.subject || "General";
            }
          }
        } catch (e) {
          console.error("AI metadata failed for", videoId, e);
        }
      }

      // Use YouTube oEmbed for title (free, no key needed)
      try {
        const oembedResp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
        if (oembedResp.ok) {
          const oembed = await oembedResp.json();
          if (oembed.title) title = oembed.title;
        }
      } catch (_) {}

      const { error } = await supabase.from("videos").insert({
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        uploaded_by: adminRole.user_id,
        subject,
      });

      if (!error) inserted++;
    }

    // Move ended live streams to videos
    await moveEndedStreamsToVideos(supabase, adminRole.user_id);

    return new Response(JSON.stringify({ message: `Synced ${inserted} new videos`, synced: inserted, total_found: newIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-youtube error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function moveEndedStreamsToVideos(supabase: any, uploadedBy: string) {
  const { data: endedStreams } = await supabase
    .from("live_streams")
    .select("*")
    .eq("status", "ended");

  if (!endedStreams || endedStreams.length === 0) return;

  for (const stream of endedStreams) {
    // Check if video already exists
    const { data: existing } = await supabase
      .from("videos")
      .select("id")
      .eq("video_url", stream.youtube_url)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from("videos").insert({
        title: `${stream.title} (Live Class Recording)`,
        description: `Recorded live class from ${new Date(stream.created_at).toLocaleDateString()}`,
        video_url: stream.youtube_url,
        thumbnail_url: `https://img.youtube.com/vi/${stream.youtube_id}/hqdefault.jpg`,
        uploaded_by: uploadedBy,
        subject: stream.subject || "General",
      });
    }

    // Mark as archived so we don't process again
    await supabase.from("live_streams").update({ status: "archived" }).eq("id", stream.id);
  }
}
