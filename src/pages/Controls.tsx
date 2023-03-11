import React from "react"

import Typography from "@mui/joy/Typography"
import Slider from "@mui/joy/Slider"
import Button from "@mui/joy/Button"
import Stack from "@mui/joy/Stack"

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"

import styled from "styled-components"
import { useControlState } from "../providers/ControlProvider"

const Card = styled.div`
  border: 1px solid #cfcfcf;
  border-radius: 0.33em;
  padding: 1rem 2rem;
  margin-top: 1rem;
  box-sizing: border-box;

  .header {
    font-weight: bold;
    margin: 0px -10px;
  }
`

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
  const { running } = controls

  return (
    <>
      <Typography level="h2">Controls</Typography>
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
                speed: value as number,
              }))
            }}
          />
        </Card>
        <Button
          variant="soft"
          color="primary"
          loading={running}
          onClick={() => {
            setControls((prev: ControlState) => ({
              ...prev,
              running: true,
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
