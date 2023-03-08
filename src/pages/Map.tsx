/* global kakao */

import React, { useEffect, useState, useMemo } from "react"
import KakaoMap from "../components/KakaoMap"

import Dot from "../components/Dot"
import { CustomOverlayMap } from "react-kakao-maps-sdk"

type MarkerPosition = {
  key: string | null
  lat: number
  lng: number
}

export default function Map() {
  const latitude = 37.52897
  const longitude = 126.917101
  const [markerPositions, setMarkerPositions] = useState<Array<MarkerPosition>>(
    []
  )

  useEffect(() => {
    setMarkerPositions([
      { key: "marker-1", lat: 37.52897, lng: 126.917101 },
      { key: "marker-2", lat: 37.5268796, lng: 126.919094 },
      { key: "marker-3", lat: 37.527502, lng: 126.920146 },
    ])
  }, [])

  return (
    <>
      <KakaoMap
        center={{
          lat: latitude,
          lng: longitude,
        }}
        level={3}
        style={{
          width: "100%",
          height: "100vh",
        }}
      >
        {markerPositions.map(({ key, lat, lng }: MarkerPosition) => (
          <CustomOverlayMap
            key={key}
            position={{
              lat,
              lng,
            }}
          >
            <Dot size={2} />
          </CustomOverlayMap>
        ))}
      </KakaoMap>
    </>
  )
}
