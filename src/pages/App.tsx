import React from "react"
import Map from "./Map"
import Aside from "../components/Aside"
import { ControlProvider } from "../providers/ControlProvider"
import { StatusProvider } from "../providers/StatusProvider"
import SidePanel from "./SidePanel"

function App() {
  return (
    <div className="App">
      <StatusProvider>
        <ControlProvider>
          <Map />
          <div className="hud-overlay">
            <Aside>
              <SidePanel />
            </Aside>
          </div>
        </ControlProvider>
      </StatusProvider>
    </div>
  )
}

export default App
