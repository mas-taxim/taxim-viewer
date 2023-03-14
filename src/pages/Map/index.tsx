import React, { useState } from "react"

import KakaoMap from "../../components/KakaoMap"
import Viewer from "./Viewer"
import Editor from "./Editor"
import { useControlState } from "../../providers/ControlProvider"

import "./index.css"

export default function Map() {
  const [controls, setControls] = useControlState()

  const latitude = 37.52897
  const longitude = 126.917101
  const [level, setLevel] = useState<number>(3)

  return (
    <>
      <KakaoMap
        center={{
          lat: latitude,
          lng: longitude,
        }}
        level={level}
        onZoomChanged={(map) => setLevel(map.getLevel())}
        style={{
          width: "100%",
          height: "100vh",
          zIndex: 0,
        }}
      >
        {controls.mode == "view" ? <Viewer /> : <Editor />}
      </KakaoMap>
    </>
  )
}
