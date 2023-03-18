import React from "react"

import { Typography, Slider, Stack } from "@mui/joy"

import Card from "../../components/AsideCard"
import { useControlState, ControlState } from "../../providers/ControlProvider"

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
      </Stack>
    </>
  )
}

export default Controls
