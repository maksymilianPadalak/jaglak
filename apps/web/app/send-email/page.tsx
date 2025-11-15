'use client';

import { useState } from "react";

interface SentInfo {
  to: string;
  subject: string;
}

export default function SendEmailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<SentInfo | null>(null);

  const handleSend = async () => {
    if (!to || !subject || !message) {
      setError("All fields are required");
      setStatus("error");
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/email/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to,
            subject,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send email");
      }

      setStatus("success");
      setLastSent({ to, subject });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send email");
    }
  };

  const handleClear = () => {
    setTo("");
    setSubject("");
    setMessage("");
    setStatus("idle");
    setError(null);
    setLastSent(null);
  };

  return (
    <main className="min-h-screen bg-white p-4 pt-12">
      <div className="max-w-3xl mx-auto border-2 border-black bg-white">
        <div className="border-b-2 border-black p-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Send Email
          </h1>
          <p className="text-sm font-bold uppercase text-black">
            Quick mockup — input + buttons only
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black">
              Recipient
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="EMAIL@EXAMPLE.COM"
              className="w-full border-2 border-black px-4 py-3 font-mono text-sm uppercase bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="SUBJECT"
              className="w-full border-2 border-black px-4 py-3 font-mono text-sm uppercase bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black">
              Message
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="TYPE YOUR MESSAGE..."
              className="w-full border-2 border-black px-4 py-3 font-mono text-sm uppercase bg-white text-black placeholder-black/50 focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
            />
          </div>

          {status === "sending" && (
            <div className="border-2 border-black bg-white p-3 text-sm font-bold uppercase flex items-center gap-3">
              <span className="inline-flex h-4 w-4 border-2 border-black border-t-transparent animate-spin"></span>
              Sending email...
            </div>
          )}

          {error && (
            <div className="border-2 border-black bg-white p-3 text-sm font-bold uppercase text-red-600">
              {error}
            </div>
          )}

          {status === "success" && lastSent && (
            <div className="border-2 border-black bg-black text-white p-3 text-sm font-bold uppercase flex flex-col gap-1">
              <span>Email sent successfully</span>
              <span className="text-xs opacity-70">
                To: {lastSent.to} | Subject: {lastSent.subject}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSend}
              disabled={status === "sending"}
              className={`border-2 border-black px-6 py-3 font-black uppercase text-sm transition-colors ${
                status === "sending"
                  ? "bg-white text-black opacity-50 cursor-not-allowed"
                  : "bg-black text-white hover:bg-white hover:text-black"
              }`}
            >
              {status === "sending" ? "Sending..." : "Send Email"}
            </button>
            <button
              onClick={handleClear}
              className="border-2 border-black px-6 py-3 font-black uppercase text-sm bg-white text-black hover:bg-black hover:text-white transition-colors"
            >
              Clear Fields
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

