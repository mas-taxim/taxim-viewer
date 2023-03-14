/* global kakao */

import React, { useEffect, useState, useCallback } from "react"
import Point from "../../components/Point"
import { useControlState, ControlState } from "../../providers/ControlProvider"

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
  const [controls, setControls] = useControlState()
  const [editMode, setEditMode] = useState<string>()

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  useEffect(() => {
    setEditMode((controls as ControlState).editMode)
  }, [controls])

  const onMapClick = useCallback(
    ({ latLng: loc }: any) => {
      if (editMode !== "add") {
        return
      }
      const lat = loc.getLat()
      const lng = loc.getLng()
      setNodes((prev) => {
        const node = { key: `node-${prev.length}`, lat, lng } as NodeType
        console.log("add node", node)
        return [...prev, node]
      })
    },
    [editMode]
  )

  useEffect(() => {
    map.setCursor("default")
    kakao.maps.event.addListener(map, "click", onMapClick)
    return () => {
      map.setCursor("")
      kakao.maps.event.removeListener(map, "click", onMapClick)
    }
  }, [map, onMapClick])

  const onActivePoint = useCallback(
    (evt: any) => {
      if (editMode !== "link") {
        return
      }
    },
    [editMode]
  )

  const onReleasePoint = useCallback(
    (evt: any) => {
      if (editMode !== "link") {
        return
      }
    },
    [editMode]
  )

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
            <Point
              size={6 / level}
              onMouseDown={onActivePoint}
              onMouseUp={onReleasePoint}
            />
          </CustomOverlayMap>
        )
      )}
    </>
  )
}

export default Editor
