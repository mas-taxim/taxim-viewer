import React from "react"
import Map from "./pages/Map"
import ControlPanel from "./components/ControlPanel"

function App() {
  return (
    <div className="App">
      <Map />
      <div className="hud-overlay">
        <ControlPanel />
      </div>
    </div>
  )
}

export default App
