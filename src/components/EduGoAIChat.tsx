import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, ImagePlus, Loader2, GraduationCap, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edugo-ai`;

const EduGoAIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag state for the floating button
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; bx: number; by: number } | null>(null);
  const didDragRef = useRef(false);

  // Drag state for the chat box
  const [boxOffset, setBoxOffset] = useState({ x: 0, y: 0 });
  const boxDragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [boxDragging, setBoxDragging] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // --- Button drag handlers ---
  const onBtnPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, bx: btnPos.x, by: btnPos.y };
    didDragRef.current = false;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [btnPos]);

  const onBtnPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true;
    setBtnPos({ x: dragStartRef.current.bx + dx, y: dragStartRef.current.by + dy });
  }, []);

  const onBtnPointerUp = useCallback(() => {
    dragStartRef.current = null;
    setDragging(false);
    if (!didDragRef.current) setOpen((o) => !o);
  }, []);

  // --- Chat box drag handlers (header only) ---
  const onBoxPointerDown = useCallback((e: React.PointerEvent) => {
    boxDragRef.current = { x: e.clientX, y: e.clientY, ox: boxOffset.x, oy: boxOffset.y };
    setBoxDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [boxOffset]);

  const onBoxPointerMove = useCallback((e: React.PointerEvent) => {
    if (!boxDragRef.current) return;
    const dx = e.clientX - boxDragRef.current.x;
    const dy = e.clientY - boxDragRef.current.y;
    setBoxOffset({ x: boxDragRef.current.ox + dx, y: boxDragRef.current.oy + dy });
  }, []);

  const onBoxPointerUp = useCallback(() => {
    boxDragRef.current = null;
    setBoxDragging(false);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text && !imagePreview) return;
    if (isLoading) return;

    const userMsg: Msg = {
      role: "user",
      content: text || "Please help with this image",
      imageUrl: imagePreview || undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setImagePreview(null);
    setIsLoading(true);

    const apiMessages = newMessages.map((m) => {
      if (m.imageUrl) {
        return {
          role: m.role,
          content: [
            { type: "text" as const, text: m.content },
            { type: "image_url" as const, image_url: { url: m.imageUrl } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Failed to connect" }));
        upsertAssistant(err.error || "Sorry, something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      if (!assistantSoFar) {
        upsertAssistant("I couldn't generate a response. Please try again.");
      }
    } catch {
      upsertAssistant("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [input, imagePreview, isLoading, messages]);

  const clearChat = () => {
    setMessages([]);
    setImagePreview(null);
    setInput("");
  };

  return (
    <>
      {/* Floating draggable button */}
      <button
        onPointerDown={onBtnPointerDown}
        onPointerMove={onBtnPointerMove}
        onPointerUp={onBtnPointerUp}
        style={{
          transform: `translate(${btnPos.x}px, ${btnPos.y}px)`,
          touchAction: "none",
        }}
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 select-none ${
          open
            ? "bg-muted text-muted-foreground scale-90"
            : "bg-primary text-primary-foreground hover:scale-110"
        } ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        aria-label="Open EduGoAI Tutor"
      >
        {open ? <X className="w-6 h-6" /> : <GraduationCap className="w-7 h-7" />}
      </button>

      {/* Draggable chat box */}
      {open && (
        <div
          style={{
            transform: `translate(${boxOffset.x}px, ${boxOffset.y}px)`,
            touchAction: "none",
          }}
          className="fixed bottom-36 right-4 z-50 w-[92vw] sm:w-[380px] max-w-[calc(100vw-1rem)] h-[520px] max-h-[calc(100vh-10rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          {/* Header – draggable */}
          <div
            onPointerDown={onBoxPointerDown}
            onPointerMove={onBoxPointerMove}
            onPointerUp={onBoxPointerUp}
            className={`bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0 select-none ${boxDragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-primary-foreground truncate">EduGoAI</h3>
                <p className="text-[10px] text-primary-foreground/70 truncate">Your personal tutor</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground" onClick={clearChat}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6 px-3">
                  <GraduationCap className="w-10 h-10 mx-auto text-primary/30 mb-3" />
                  <p className="text-sm font-medium text-foreground/80">Hi! I'm EduGoAI</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask me any study question or upload an image of a problem!
                  </p>
                  <div className="mt-4 space-y-1.5">
                    {["Solve: 2x + 5 = 15", "Explain photosynthesis", "What is Newton's 3rd law?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground/70 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm break-words overflow-hidden ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2 max-h-32 object-contain" />
                    )}
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-x-auto [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:text-xs [&_code]:break-all [&_table]:text-xs [&_table]:w-full [&_img]:max-w-full">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="break-words">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Image preview */}
          {imagePreview && (
            <div className="px-3 py-1.5 border-t border-border/50 flex items-center gap-2 bg-muted/50">
              <img src={imagePreview} alt="Preview" className="h-10 w-10 rounded object-cover flex-shrink-0" />
              <span className="text-xs text-muted-foreground flex-1 truncate">Image attached</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => setImagePreview(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-2 border-t border-border/50 flex items-center gap-1.5 flex-shrink-0">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="h-8 text-sm flex-1 min-w-0"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !imagePreview)}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default EduGoAIChat;
