import React from "react"

import { Stack } from "@mui/joy"

import Card from "../../components/AsideCard"

const Editor = (): React.ReactElement => {
  return (
    <>
      <Stack spacing={2}>
        <Card
          style={{
            paddingBottom: "1.75rem",
          }}
        >
          Editor Panel
        </Card>
      </Stack>
    </>
  )
}

export default Editor
