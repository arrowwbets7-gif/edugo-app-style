import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { youtubeUrl, youtubeId } = await req.json();
    if (!youtubeUrl && !youtubeId) {
      return new Response(JSON.stringify({ error: "YouTube URL or ID is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const id = youtubeId || youtubeUrl;

    // Try to get title from oEmbed first (free, no key)
    let oembedTitle = "";
    try {
      const url = youtubeUrl || `https://www.youtube.com/watch?v=${youtubeId}`;
      const oResp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (oResp.ok) {
        const oData = await oResp.json();
        oembedTitle = oData.title || "";
      }
    } catch (_) {}

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are an educational content assistant. Given YouTube video "${oembedTitle || id}" from EduGoClasses (Indian education channel), generate metadata.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "video_metadata",
            description: "Return video metadata with title, description, subject, and tags",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Concise descriptive title, max 100 chars" },
                description: { type: "string", description: "Brief educational description, max 200 chars" },
                subject: { type: "string", enum: ["Math", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "Computer Science", "General"] },
                tags: { type: "array", items: { type: "string" }, description: "2-3 relevant tags" },
              },
              required: ["title", "description", "subject", "tags"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "video_metadata" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add funds" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      // Fallback to oEmbed title
      return new Response(JSON.stringify({
        title: oembedTitle || `Video ${id}`,
        description: "",
        subject: "General",
        tags: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    // Prefer oEmbed title if AI didn't have enough context
    if (oembedTitle && (!result.title || result.title.length < 5)) {
      result.title = oembedTitle;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-video-helper error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
