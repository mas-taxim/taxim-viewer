/* global kakao */

import React, { useEffect, useState, useRef } from "react"

type MapProps = {
  latitude: number
  longitude: number
}

export default function Map({
  latitude,
  longitude,
}: MapProps): React.HTMLDivElement {
  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null)

  const newMarker = (lat: number, lng: number): kakao.maps.Marker =>
    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng),
    })

  const [markers, setMarkers] = useState<Array<kakao.maps.Marker>>([])

  const container: React.MutableRefObject<kakao.maps.Map | undefined> = useRef()

  useEffect(() => {
    const script = document.createElement("script")
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`
    document.head.appendChild(script)

    script.onload = () => {
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(latitude, longitude)
        const options = {
          center,
          level: 3,
        }
        const map = new kakao.maps.Map(container.current, options)
        setKakaoMap(map)
      })
    }
  }, [container])

  useEffect(() => {
    if (kakaoMap === null) {
      return
    }

    // save center position
    const center = kakaoMap.getCenter()

    // change viewport size
    const handleViewport = () => {
      const [width, height] = [window.innerWidth, window.innerHeight]
      container.current.style.width = `${width}px`
      container.current.style.height = `${height}px`
    }

    handleViewport()
    window.addEventListener("resize", handleViewport)

    // relayout and...
    kakaoMap.relayout()
    // restore
    kakaoMap.setCenter(center)

    return () => {
      window.removeEventListener("resize", handleViewport)
    }
  }, [kakaoMap])

  useEffect(() => {
    if (kakaoMap === null) {
      return
    }

    const positions = [
      [37.52897, 126.917101],
      [37.52897, 126.917101],
      [37.5268796, 126.919094],
      [37.527502, 126.920146],
    ]
    const _markers: Array<kakao.maps.Marker> = positions.map(
      (pos) =>
        new kakao.maps.Marker({
          map: kakaoMap,
          position: new kakao.maps.LatLng(pos[0], pos[1]),
        })
    )
    setMarkers(_markers)
  }, [kakaoMap, setMarkers])

  return <div id="container" ref={container} />
}
