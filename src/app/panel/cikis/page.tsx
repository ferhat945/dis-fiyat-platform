"use client";

import { useEffect, useState } from "react";

export default function LogoutPage(): JSX.Element {
  const [msg, setMsg] = useState<string>("Çıkış yapılıyor...");

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        await fetch("/api/panel/logout", { method: "POST" });
      } catch {
        // yinede yönlendireceğiz
      } finally {
        setMsg("Yönlendiriliyor...");
        window.location.href = "/panel/login";
      }
    };

    void run();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Çıkış</h1>
      <div>{msg}</div>
    </div>
  );
}
