import React, { useEffect } from "react"

type ScriptProps = {
  src: string
  location?: "head" | "body"
}

export const loadScript = ({
  src,
  location = "head",
}: ScriptProps): HTMLScriptElement | null => {
  if (document.querySelector(`script[src="${src}"]`)) {
    return null
  }
  const script = document.createElement("script")
  script.src = src
  const container = location === "head" ? document.head : document.body
  container.appendChild(script)
  return script
}
