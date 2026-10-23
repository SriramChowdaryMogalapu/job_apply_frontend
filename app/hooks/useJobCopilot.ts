// app/hooks/useJobCopilot.ts
"use client";

import { useState } from "react";

// Declare global types for Chrome extension messaging on window
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback?: (response: unknown) => void
        ) => void;
        lastError?: { message: string };
      };
    };
  }
}

export function useJobCopilot() {
  const [isLaunching, setIsLaunching] = useState(false);

  const launchAutofill = (jobUrl: string, jobId: string) => {
    setIsLaunching(true);

    const chromeRuntime = typeof window !== "undefined" ? window.chrome?.runtime : undefined;

    if (!chromeRuntime || typeof chromeRuntime.sendMessage !== "function") {
      alert(
        "Chrome Extension runtime not detected. Ensure you are using Google Chrome with the JobApply extension installed."
      );
      setIsLaunching(false);
      window.open(jobUrl, "_blank");
      return;
    }

    const extensionId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || "";

    chromeRuntime.sendMessage(
      extensionId,
      { action: "OPEN_AND_AUTOFILL", url: jobUrl, jobId: jobId },
      (response: unknown) => {
        setIsLaunching(false);

        // Safely check lastError using optional chaining
        const error = window.chrome?.runtime?.lastError;
        if (error) {
          console.warn(
            "Direct extension handshake failed. Opening fallback tab:",
            error.message
          );
          window.open(jobUrl, "_blank");
        } else {
          console.log("[JobCopilot] Handshake successful:", response);
        }
      }
    );
  };

  return { launchAutofill, isLaunching };
}