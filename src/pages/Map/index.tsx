import React, { useState, useCallback } from "react"

import KakaoMap from "../../components/KakaoMap"
import HorizontalContainer from "../../components/HorizontalContainer"
import { Button } from "@mui/joy"
import Viewer from "./Viewer"
import Editor from "./Editor"
import CableIcon from "@mui/icons-material/Cable"
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import { useControlState, ControlState } from "../../providers/ControlProvider"

import "./index.css"

type SwitchButtonProps = React.PropsWithChildren & {
  mode: "view" | "edit"
  onChange: (mode: string) => void
}

const SwitchButton = ({
  mode,
  onChange,
}: SwitchButtonProps): React.ReactElement => (
  <>
    <Button
      size="sm"
      startDecorator={<LocalTaxiIcon />}
      variant={mode === "view" ? "solid" : "plain"}
      onClick={() => onChange("view")}
      sx={{
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      Viewer
    </Button>
    <Button
      size="sm"
      startDecorator={<CableIcon />}
      variant={mode === "edit" ? "solid" : "plain"}
      onClick={() => onChange("edit")}
      sx={{
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      Editor
    </Button>
  </>
)

export default function Map() {
  const [controls, setControls] = useControlState()

  const latitude = 37.52897
  const longitude = 126.917101
  const [level, setLevel] = useState<number>(3)

  const SwitchButtonControlled = useCallback(
    (): React.ReactElement => (
      <HorizontalContainer
        position="top"
        gap={0}
        style={{
          padding: 0,
          height: "auto",
        }}
      >
        <SwitchButton
          mode={controls.mode}
          onChange={(mode: string) => {
            setControls((prev) => ({ ...prev, mode } as ControlState))
          }}
        />
      </HorizontalContainer>
    ),
    [(controls as ControlState).mode, setControls]
  )

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
        <SwitchButtonControlled />
        {controls.mode == "view" ? <Viewer /> : <Editor />}
      </KakaoMap>
    </>
  )
}
