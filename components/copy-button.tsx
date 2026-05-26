"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
};

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-link"
      style={{
        background: "none",
        border: "none",
        padding: 0,
        font: "inherit",
        cursor: "pointer",
        marginLeft: "8px",
        display: "inline-block"
      }}
      type="button"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
