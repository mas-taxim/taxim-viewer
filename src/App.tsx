import React from "react"
import Map from "./pages/Map"
import Aside from "./components/Aside"
import Controls from "./pages/Controls"
import { ControlProvider } from "./providers/ControlProvider"

function App() {
  return (
    <div className="App">
      <ControlProvider>
        <Map />
        <div className="hud-overlay">
          <Aside>
            <Controls />
          </Aside>
        </div>
      </ControlProvider>
    </div>
  )
}

export default App
