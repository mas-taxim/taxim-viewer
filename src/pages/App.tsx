import React from "react"
import Map from "./Map"
import { ControlProvider } from "../providers/ControlProvider"
import { StatusProvider } from "../providers/StatusProvider"

function App() {
  return (
    <div className="App">
      <StatusProvider>
        <ControlProvider>
          <Map />
        </ControlProvider>
      </StatusProvider>
    </div>
  )
}

export default App
