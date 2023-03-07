import React, { useEffect } from "react"

type ScriptProps = {
  src: string
  async?: boolean
}

export const Script: React.FC<ScriptProps> = ({ src, async = true }) => {
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.async = async === true
    document.body.appendChild(script)
  }, [])
  return <></>
}
