import React from "react"
import Map from "./Map"
import Aside from "../components/Aside"
import Controls from "./Controls"
import Status from "./Status"
import { ControlProvider } from "../providers/ControlProvider"
import { StatusProvider } from "../providers/StatusProvider"

function App() {
  return (
    <div className="App">
      <StatusProvider>
        <ControlProvider>
          <Map />
          <div className="hud-overlay">
            <Aside>
              <Controls />
              <Status />
            </Aside>
          </div>
        </ControlProvider>
      </StatusProvider>
    </div>
  )
}

export default App
