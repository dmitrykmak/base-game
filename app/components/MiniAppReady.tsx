"use client";

import { useEffect } from "react";

// Сигналізує середовищу Base/Farcaster, що міні-апп завантажився
// і прибирає splash-екран. Безпечно працює і поза Base (у звичайному браузері).
export default function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        if (!cancelled) await sdk.actions.ready();
      } catch {
        // не в середовищі Base — це нормально
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
