import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHANNEL_URL = "https://www.youtube.com/@edugoclasses/videos";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    // Get caller's user id from auth header
    const authHeader = req.headers.get("authorization") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const callerClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check caller is teacher/admin
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAllowed = roles?.some((r: any) => r.role === "teacher" || r.role === "admin");
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Scrape channel page for video IDs
    const pageResp = await fetch(CHANNEL_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; EduGoBot/1.0)" },
    });
    const html = await pageResp.text();
    const videoIdRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    const foundIds = new Set<string>();
    let match;
    while ((match = videoIdRegex.exec(html)) !== null) {
      foundIds.add(match[1]);
    }

    if (foundIds.size === 0) {
      return new Response(JSON.stringify({ message: "No videos found on channel page", added: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get existing video URLs to skip duplicates
    const { data: existingVideos } = await supabase.from("videos").select("video_url");
    const existingIds = new Set(
      (existingVideos || []).map((v: any) => {
        const m = v.video_url.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      }).filter(Boolean)
    );

    const newIds = [...foundIds].filter((id) => !existingIds.has(id));

    if (newIds.length === 0) {
      return new Response(JSON.stringify({ message: "All videos already synced", added: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process new videos (limit to 10 per sync to avoid timeouts)
    const toProcess = newIds.slice(0, 10);
    let added = 0;

    for (const ytId of toProcess) {
      try {
        // Get title via oEmbed (free, no key)
        let oembedTitle = "";
        try {
          const oResp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
          if (oResp.ok) {
            const oData = await oResp.json();
            oembedTitle = oData.title || "";
          }
        } catch (_) {}

        // Skip non-educational content based on title keywords
        const skipKeywords = ["tour", "vlog", "trip", "picnic", "celebration", "party", "dance", "fun", "outing"];
        const lowerTitle = oembedTitle.toLowerCase();
        if (skipKeywords.some((kw) => lowerTitle.includes(kw))) {
          console.log(`Skipping non-educational video: ${oembedTitle}`);
          continue;
        }

        // Use AI to get metadata
        let title = oembedTitle || `Video ${ytId}`;
        let description = "";
        let subject = "General";

        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [{
                role: "user",
                content: `You are an educational content classifier. Given this YouTube video title "${oembedTitle || ytId}" from EduGoClasses (an Indian education channel for school students), generate metadata. If the title doesn't seem educational, set subject to "Skip".`,
              }],
              tools: [{
                type: "function",
                function: {
                  name: "video_metadata",
                  description: "Return video metadata",
                  parameters: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Clean concise title, max 100 chars" },
                      description: { type: "string", description: "Brief educational description, max 200 chars" },
                      subject: { type: "string", enum: ["Math", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "Computer Science", "General", "Skip"] },
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
              const result = JSON.parse(toolCall.function.arguments);
              if (result.subject === "Skip") {
                console.log(`AI skipped non-educational: ${oembedTitle}`);
                continue;
              }
              title = result.title || title;
              description = result.description || "";
              subject = result.subject || "General";
            }
          }
        } catch (aiErr) {
          console.error("AI metadata error, using oEmbed title:", aiErr);
        }

        // Insert video
        const { error: insertErr } = await supabase.from("videos").insert({
          title,
          description,
          video_url: `https://www.youtube.com/watch?v=${ytId}`,
          thumbnail_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          uploaded_by: user.id,
          subject,
        });

        if (!insertErr) added++;
        else console.error("Insert error:", insertErr);
      } catch (vidErr) {
        console.error(`Error processing ${ytId}:`, vidErr);
      }
    }

    // Also migrate ended live streams to videos
    let migratedLive = 0;
    try {
      const { data: endedStreams } = await supabase
        .from("live_streams")
        .select("*")
        .eq("status", "ended");

      if (endedStreams && endedStreams.length > 0) {
        for (const stream of endedStreams) {
          const streamYtId = stream.youtube_id;
          if (existingIds.has(streamYtId)) continue;

          const { error: liveInsertErr } = await supabase.from("videos").insert({
            title: stream.title,
            description: `Live class recording - ${stream.subject || "General"}`,
            video_url: stream.youtube_url,
            thumbnail_url: `https://img.youtube.com/vi/${streamYtId}/hqdefault.jpg`,
            uploaded_by: stream.started_by,
            subject: stream.subject || "General",
          });

          if (!liveInsertErr) migratedLive++;
        }
      }
    } catch (liveErr) {
      console.error("Live migration error:", liveErr);
    }

    return new Response(JSON.stringify({
      message: `Sync complete: ${added} new videos added, ${migratedLive} live streams archived`,
      added,
      migratedLive,
      remaining: Math.max(0, newIds.length - toProcess.length),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-youtube error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
