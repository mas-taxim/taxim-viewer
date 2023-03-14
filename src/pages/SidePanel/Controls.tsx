import React, { useEffect, useState } from "react"

import { Typography, Slider, Button, Stack } from "@mui/joy"

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"
import UploadIcon from "@mui/icons-material/Upload"

import Card from "../../components/AsideCard"
import { useControlState, ControlState } from "../../providers/ControlProvider"
import { useStatusState, StatusState } from "../../providers/StatusProvider"

const marks = [
  {
    value: 1.0,
    label: "x1.0",
  },
  {
    value: 2.0,
    label: "x2.0",
  },
  {
    value: 4.0,
    label: "x4.0",
  },
  {
    value: 8.0,
    label: "x8.0",
  },
]

const Controls = (): React.ReactElement => {
  const [controls, setControls] = useControlState()
  const [status, setStatus] = useStatusState()
  const [ready, setReady] = useState<boolean>(false)

  const { viewRunning: running } = controls as ControlState

  useEffect(() => {
    const { logs } = status as StatusState
    setReady(logs && logs.length > 0)
  }, [status])

  return (
    <>
      <Stack spacing={2}>
        <Card
          style={{
            paddingBottom: "1.75rem",
          }}
        >
          <Typography className="header">Time Speed</Typography>
          <Slider
            color="primary"
            aria-label="Time Speed"
            defaultValue={1.0}
            min={1.0}
            max={8.0}
            step={0.5}
            disabled={false}
            marks={marks}
            size="lg"
            valueLabelDisplay="off"
            variant="solid"
            onChangeCommitted={(
              event: React.SyntheticEvent | Event,
              value: number | number[]
            ) => {
              console.log("new value", value)
              setControls((prev: ControlState) => ({
                ...prev,
                viewSpeed: value as number,
              }))
            }}
            style={{
              width: "calc(100% - 0.5rem)",
              marginLeft: "0.5rem",
            }}
          />
        </Card>
        <label
          htmlFor="upload-log"
          style={{
            width: "100%",
          }}
        >
          <input
            style={{ display: "none" }}
            id="upload-log"
            name="upload-log"
            type="file"
            accept=".json,application/json"
            onChange={(evt) => {
              const files = evt.target.files
              if (!files || files.length < 1) {
                return
              }
              const file = files[0]
              const reader: FileReader = new FileReader()
              reader.addEventListener("load", (event: any) => {
                const result = event.target.result
                try {
                  const { logs } = JSON.parse(result)
                  setStatus((prev) => ({ ...prev, logs }))
                } catch {
                  window.alert("Wrong JSON file format")
                }
              })
              reader.readAsText(file)
            }}
          />
          <Button
            color="primary"
            variant="soft"
            component="div"
            sx={{
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Upload */}
            <UploadIcon />
          </Button>
        </label>
        <Button
          variant="soft"
          color="success"
          loading={running}
          disabled={!ready}
          onClick={() => {
            setControls((prev: ControlState) => ({
              ...prev,
              viewRunning: true,
            }))
          }}
        >
          Run
          <KeyboardArrowRight
            style={{
              position: "absolute",
              right: "0.5rem",
            }}
          />
        </Button>
      </Stack>
    </>
  )
}

export default Controls
