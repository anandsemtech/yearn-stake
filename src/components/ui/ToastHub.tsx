// src/components/ui/ToastHub.tsx
import React, { useEffect, useState } from "react";

type Toast = {
  id: string;
  kind: "success" | "error";
  title: string;
  description?: string;
  // 4.5s for mobile readability; long messages truncate via CSS
  durationMs?: number;
};

const genId = () => Math.random().toString(36).slice(2);

export default function ToastHub() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(t: Omit<Toast, "id">) {
    const id = genId();
    const toast = { id, durationMs: 4500, ...t };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => dismiss(id), toast.durationMs);
  }
  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    const onErr = (e: any) => {
      const { title, description } = e.detail ?? {};
      push({ kind: "error", title: title ?? "Error", description });
    };
    const onOk = (e: any) => {
      const { title, description } = e.detail ?? {};
      push({ kind: "success", title: title ?? "Success", description });
    };
    window.addEventListener("toast:error", onErr as EventListener);
    window.addEventListener("toast:success", onOk as EventListener);
    return () => {
      window.removeEventListener("toast:error", onErr as EventListener);
      window.removeEventListener("toast:success", onOk as EventListener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] flex flex-col items-center gap-2 p-3 sm:p-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto w-full max-w-[520px] sm:max-w-[420px]",
            "rounded-2xl shadow-2xl ring-1 backdrop-blur",
            t.kind === "error"
              ? "bg-[#1a0f1a]/92 ring-rose-500/20"
              : "bg-[#0f1714]/92 ring-emerald-500/20",
          ].join(" ")}
          role="status"
        >
          <div className="flex items-start gap-3 p-3">
            <div className="mt-0.5 shrink-0">
              {t.kind === "error" ? (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">!</span>
              ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">✓</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-[12px] leading-snug text-white/80 line-clamp-3 break-words">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
