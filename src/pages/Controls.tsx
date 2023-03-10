import React from "react"

import Typography from "@mui/joy/Typography"
import Slider from "@mui/joy/Slider"
import Button from "@mui/joy/Button"
import Stack from "@mui/joy/Stack"

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"

import styled from "styled-components"

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
    value: 60,
    label: "x1.0",
  },
  {
    value: 60 * 2,
    label: "x2.0",
  },
  {
    value: 60 * 4,
    label: "x4.0",
  },
  {
    value: 60 * 8,
    label: "x8.0",
  },
]

const Controls = (): React.ReactElement => {
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
            defaultValue={60}
            min={60}
            max={60 * 8}
            disabled={false}
            marks={marks}
            size="lg"
            valueLabelDisplay="off"
            variant="solid"
          />
        </Card>
        <Button variant="soft" color="primary">
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
