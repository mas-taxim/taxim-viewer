/* global kakao */

import React, { useEffect, useState } from "react"
import Point from "../../components/Point"
import { CustomOverlayMap, useMap } from "react-kakao-maps-sdk"

type NodeType = {
  key: string
  lat: number
  lng: number
}

const Editor = (): React.ReactElement => {
  const map: kakao.maps.Map = useMap()
  const [nodes, setNodes] = useState<Array<NodeType>>([])
  const [level, setLevel] = useState<number>(1)

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  useEffect(() => {
    map.setCursor("default")
    const onClick = ({ latLng: loc }: any) => {
      const lat = loc.getLat()
      const lng = loc.getLng()
      setNodes((prev) => [
        ...prev,
        { key: `node-${prev.length}`, lat, lng } as NodeType,
      ])
    }
    kakao.maps.event.addListener(map, "click", onClick)
    return () => {
      map.setCursor("")
      kakao.maps.event.removeListener(map, "click", onClick)
    }
  }, [map])

  return (
    <>
      {nodes.map(
        ({ key, lat, lng }: NodeType): React.ReactElement => (
          <CustomOverlayMap
            key={key}
            position={{
              lat,
              lng,
            }}
          >
            <Point size={6 / level} />
          </CustomOverlayMap>
        )
      )}
    </>
  )
}

export default Editor
