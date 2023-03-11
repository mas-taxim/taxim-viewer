import React, { useEffect, useState } from "react"
import KakaoMap from "../components/KakaoMap"

import Dot from "../components/Dot"
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import { CustomOverlayMap, CustomOverlayMapProps } from "react-kakao-maps-sdk"

import "./Map.css"
import { useControlState, ControlState } from "../providers/ControlProvider"
import { useStatusState } from "../providers/StatusProvider"

type MarkerPosition = {
  key: string | null
  color?: string
  size: number
  lat: number
  lng: number
}

interface ColorName {
  [key: string]: string
}

const randomColor = () => "#" + Math.random().toString(16).slice(-6)

export default function Map() {
  const latitude = 37.52897
  const longitude = 126.917101
  const [markerPositions, setMarkerPositions] = useState<Array<MarkerPosition>>(
    []
  )
  const [level, setLevel] = useState<number>(3)
  const [controls, setControls] = useControlState()
  const [status, setStatus] = useStatusState()

  const { running, speed } = controls as ControlState

  useEffect(() => {
    console.log(controls)

    // 1 frame contains 60 secs
    const DEFAULT_TIMESTEP = 60 * 1000
    // 1 frame / 1000 ms
    const interval = DEFAULT_TIMESTEP / 60 / (speed || 1.0)
    console.log("info", interval, running, speed)

    if (!running) return

    const finish = () => {
      setControls((prev) => ({ ...prev, running: false }))
    }

    let timer: any = null
    ;(async () => {
      // dummy test file
      const { logs } = await fetch(
        "https://api.github.com/gists/43807f8eee7f54d19f167130234fdc15"
      )
        .then((r) => r.json())
        .then(({ files }) => files["20230308005358.min.json"])
        .then(({ content }) => JSON.parse(content))

      if (!logs) return

      let index = 0
      const colors: ColorName = {}

      timer = setInterval(() => {
        if (index >= logs.length) {
          finish()
          return
        }
        const { time, vehicles, task } = logs[index]
        setStatus((prev) => ({ ...prev, currentTime: time }))
        index += 1

        vehicles.forEach(({ name }: any) => {
          if (!(name in colors)) {
            colors[name] = randomColor()
          }
        })
        task.forEach(({ id }: any) => {
          const name = `task-${id}`
          if (!(name in colors)) {
            colors[name] = randomColor()
          }
        })

        const vMarkers = vehicles.map(({ name, lat, lng }: any) => ({
          key: name,
          color: colors[name],
          size: 6,
          lat,
          lng,
        }))

        const tMarkers = task
          .map(({ id, pick_lat, pick_lng, drop_lat, drop_lng }: any) => [
            {
              key: `task-${id}-pick`,
              color: colors[`task-${id}`],
              size: 3,
              lat: pick_lat,
              lng: pick_lng,
            },
            {
              key: `task-${id}-drop`,
              color: colors[`task-${id}`],
              size: 3,
              lat: drop_lat,
              lng: drop_lng,
            },
          ])
          .flat()

        setMarkerPositions([...vMarkers, ...tMarkers])
      }, interval)
    })()
    return () => {
      clearInterval(timer)
      finish()
    }
  }, [running])

  return (
    <>
      <KakaoMap
        center={{
          lat: latitude,
          lng: longitude,
        }}
        level={level}
        onZoomChanged={(map) => setLevel(map.getLevel())}
        style={{
          width: "100%",
          height: "100vh",
          zIndex: 0,
        }}
      >
        <>
          {markerPositions.map(
            ({ key, color, size, lat, lng }: MarkerPosition) => (
              <CustomOverlayMap
                key={key}
                position={{
                  lat,
                  lng,
                }}
                ref={(ref: any) => {
                  if (ref == null) return
                  const parentNode = ref.cc.parentElement
                  parentNode.className = "vehicle-marker"
                }}
              >
                <Dot color={color || "dodgerblue"} size={size / level}>
                  <LocalTaxiIcon
                    style={{
                      fill: "white",
                      marginTop: "-1px",
                      width: "75%",
                    }}
                  />
                </Dot>
              </CustomOverlayMap>
            )
          )}
        </>
      </KakaoMap>
    </>
  )
}
