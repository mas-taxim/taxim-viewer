/* global kakao */

import React, { useEffect, useState } from "react"
import KakaoMap from "../components/KakaoMap"

import Dot from "../components/Dot"
import { CustomOverlayMap } from "react-kakao-maps-sdk"

import "./Map.css"

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

  useEffect(() => {
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
          return
        }
        const { vehicles, task } = logs[index]
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
      }, 300)
    })()
    return () => clearInterval(timer)
  }, [])

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
                <Dot color={color || "dodgerblue"} size={size / level} />
              </CustomOverlayMap>
            )
          )}
        </>
      </KakaoMap>
    </>
  )
}
