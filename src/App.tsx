import React from "react"
import Map from "./pages/Map"
import Aside from "./components/Aside"
import Controls from "./pages/Controls"

function App() {
  return (
    <div className="App">
      <Map />
      <div className="hud-overlay">
        <Aside>
          <Controls />
        </Aside>
      </div>
    </div>
  )
}

export default App
