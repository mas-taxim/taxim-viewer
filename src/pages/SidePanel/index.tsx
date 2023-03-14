import React, { useState, useEffect } from "react"

import { TabPanel, Tabs, TabList } from "@mui/joy"
import Tab, { tabClasses } from "@mui/joy/Tab"

import CableIcon from "@mui/icons-material/Cable"
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import Controls from "./Controls"
import Status from "./Status"
import Editor from "./Editor"
import { useControlState, ControlState } from "../../providers/ControlProvider"

const SidePanel = (): React.ReactElement => {
  const [controls, setControls] = useControlState()
  const [tabIndex, setTabIndex] = useState<number>(0)

  useEffect(() => {
    const { mode } = controls as ControlState
    setTabIndex(mode === "view" ? 0 : 1)
  }, [controls])

  return (
    <>
      <Tabs
        color="primary"
        sx={(theme: any) => {
          return {
            [`& .${tabClasses.root}`]: {
              bgcolor: theme.vars.palette["primary"].darkChannel,
              boxShadow: "none",
              transition: "0.3s",
              [`&:not(.${tabClasses.selected}):hover`]: {
                bgcolor: theme.vars.palette["primary"]["200"],
              },
              [`&.${tabClasses.selected}`]: {
                color: "white",
                bgcolor: theme.vars.palette["primary"]["300"],
              },
            },
          }
        }}
        onChange={(event, value) => {
          if (value === 0) {
            setControls((prev: ControlState) => ({ ...prev, mode: "view" }))
          } else {
            setControls((prev: ControlState) => ({ ...prev, mode: "edit" }))
          }
        }}
        value={tabIndex}
        defaultValue={0}
      >
        <TabList color="primary">
          <Tab>
            <LocalTaxiIcon
              sx={{
                fontSize: "100%",
                mr: 1,
              }}
            />
            Viewer
          </Tab>
          <Tab>
            <CableIcon
              sx={{
                fontSize: "100%",
                mr: 1,
              }}
            />
            Editor
          </Tab>
        </TabList>
        <TabPanel value={0} sx={{ p: 2 }}>
          <Controls />
          <Status />
        </TabPanel>
        <TabPanel value={1} sx={{ p: 2 }}>
          <Editor />
        </TabPanel>
      </Tabs>
    </>
  )
}

export default SidePanel
