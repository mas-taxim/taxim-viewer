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
    (evt: any) => {
      const { latLng: loc } = evt
      if (editMode !== "add") {
        return
      }
      const lat = loc.getLat()
      const lng = loc.getLng()
      setNodes((prev) => {
        const nodeId = Math.random().toString(16).slice(2) as string
        const node = { key: `node-${nodeId}`, lat, lng } as NodeType
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

  const onMouseDownPoint = useCallback(
    (evt: any) => {
      if (editMode === "add") {
        const toRemove = evt.button === 2 // 0 for left, 2 for right button
        if (toRemove) {
          const container = evt.target.closest("[data-id]") as HTMLElement
          const id = container.getAttribute("data-id") as string
          console.log(id, evt, container)
          setNodes((prev) => [...prev].filter(({ key }) => key !== id))
        }
      } else if (editMode === "link") {
      }
    },
    [editMode, setNodes]
  )

  const onMouseUpPoint = useCallback(
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
            position={{
              lat,
              lng,
            }}
            key={key}
          >
            <Point
              id={key}
              size={6 / level}
              onMouseDown={onMouseDownPoint}
              onMouseUp={onMouseUpPoint}
            />
          </CustomOverlayMap>
        )
      )}
    </>
  )
}

export default Editor
