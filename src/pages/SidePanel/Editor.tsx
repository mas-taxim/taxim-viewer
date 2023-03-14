import React, { useMemo } from "react"

import { Stack, RadioGroup, Sheet, Typography } from "@mui/joy"
import Radio, { radioClasses } from "@mui/joy/Radio"
import FormControl from "@mui/joy/FormControl"
import GrainIcon from "@mui/icons-material/Grain"
import PolylineIcon from "@mui/icons-material/Polyline"
import { useControlState, ControlState } from "../../providers/ControlProvider"

const Editor = (): React.ReactElement => {
  const [controls, setControls] = useControlState()

  const radioButtons = useMemo(
    () => [
      {
        key: "add-point",
        text: "점 추가하기",
        icon: <GrainIcon fontSize="medium" />,
        onSelect: () => {
          setControls((prev) => ({ ...prev, editMode: "add" }))
        },
      },
      {
        key: "link-point",
        text: "점 연결하기",
        icon: <PolylineIcon fontSize="medium" />,
        onSelect: () => {
          setControls((prev) => ({ ...prev, editMode: "link" }))
        },
      },
    ],
    [setControls]
  )

  return (
    <>
      <div style={{ marginLeft: "-16px", marginRight: "-16px" }}>
        <Stack spacing={2}>
          <FormControl>
            <RadioGroup
              aria-label="platform"
              defaultValue={radioButtons[0].key}
              overlay
              name="platform"
              orientation="horizontal"
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                [`& .${radioClasses.checked}`]: {
                  [`& .${radioClasses.action}`]: {
                    inset: -1,
                    border: "3px solid",
                    borderColor: "primary.500",
                  },
                },
                [`& .${radioClasses.radio}`]: {
                  display: "contents",
                },
              }}
            >
              {radioButtons.map(({ key, text, icon, onSelect }) => (
                <Sheet
                  key={key}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "md",
                    bgcolor: "background.body",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Radio
                    value={key}
                    sx={{
                      mt: -1,
                      mr: -1,
                      mb: 0.5,
                      alignSelf: "flex-end",
                      "--Radio-actionRadius": (theme) => theme.vars.radius.md,
                    }}
                    onChange={onSelect}
                  />
                  {icon}
                  <Typography>{text}</Typography>
                </Sheet>
              ))}
            </RadioGroup>
          </FormControl>
        </Stack>
      </div>
    </>
  )
}

export default Editor
