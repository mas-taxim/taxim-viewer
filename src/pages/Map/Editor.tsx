/* global kakao */

import React, { useEffect, useState, useCallback } from "react"
import Point from "../../components/Point"
import { useControlState, ControlState } from "../../providers/ControlProvider"

import { CustomOverlayMap, useMap, Polyline } from "react-kakao-maps-sdk"

type NodeType = {
  key: string
  lat: number
  lng: number
}

type EdgeType = {
  from: NodeType
  to: NodeType
}

const Editor = (): React.ReactElement => {
  const map: kakao.maps.Map = useMap()
  const [nodes, setNodes] = useState<Array<NodeType>>([])
  const [edges, setEdges] = useState<Array<EdgeType>>([])
  const [level, setLevel] = useState<number>(1)
  const [controls, setControls] = useControlState()
  const [editMode, setEditMode] = useState<string>()
  const [selected, setSelected] = useState<Array<string>>([])

  const isSelected = useCallback(
    (id: string) => selected.indexOf(id) !== -1,
    [selected]
  )

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  const createEdge = (from: NodeType, to: NodeType) => {
    setEdges((prev) =>
      prev
        .filter((edge) => !(edge.from == from && edge.to == to))
        .concat({
          from,
          to,
        } as EdgeType)
    )
  }

  useEffect(() => {
    console.log("edges", edges)
  }, [edges])

  useEffect(() => {
    const getNode = (id: string): NodeType | null => {
      const node = nodes.filter(({ key }: NodeType) => key === id)
      return node.length > 0 ? node[0] : null
    }
    console.log("selected", selected)
    if (selected.length >= 2) {
      const [fromID, toID] = selected
      const [from, to] = [getNode(fromID), getNode(toID)]
      if (from !== null && to !== null) {
        createEdge(from, to)
        setSelected([])
      }
      return
    }
  }, [selected, nodes])

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
      const container = evt.target.closest("[data-id]") as HTMLElement
      const id = container.getAttribute("data-id") as string
      const mouseType = evt.button as number
      if (editMode === "add") {
        if (mouseType === 2) {
          // right button
          console.log(id, evt, container)
          setNodes((prev) => [...prev].filter(({ key }) => key !== id))
        }
      } else if (editMode === "link") {
        if (mouseType === 0) {
          // left button to select
          setSelected((prev) => prev.filter((i) => i != id).concat(id))
        } else if (mouseType === 2) {
          // right button to unselect
          setSelected((prev) => prev.filter((i) => i != id))
        }
      }
    },
    [editMode, setNodes, setSelected]
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
      {edges.map(
        ({ from, to }: EdgeType): React.ReactElement => (
          <Polyline
            key={`edge-${from.key}-${to.key}`}
            path={[from, to].map(({ lat, lng }: NodeType) => ({
              lat,
              lng,
            }))}
            strokeWeight={3}
            strokeColor="#db4040"
            strokeOpacity={1}
            strokeStyle="solid"
            onCreate={console.log}
          />
        )
      )}
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
              selected={isSelected(key)}
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
