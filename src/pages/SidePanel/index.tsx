import React from "react"

import { TabPanel, Tabs, TabList } from "@mui/joy"
import Tab, { tabClasses } from "@mui/joy/Tab"

import CableIcon from "@mui/icons-material/Cable"
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import Controls from "./Controls"
import Status from "./Status"
import Editor from "./Editor"

const SidePanel = (): React.ReactElement => {
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
            console.log("Viewer")
          } else {
            console.log("Editor")
          }
        }}
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
