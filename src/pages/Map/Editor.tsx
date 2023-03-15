/* global kakao */

import React, { useEffect, useState, useCallback, useMemo } from "react"
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

const saveFile = (filename: string, blob: Blob) => {
  const a = document.createElement("a")
  a.download = filename
  a.href = URL.createObjectURL(blob)
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
  a.addEventListener("click", (e) => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000)
  })
  a.click()
}

const Editor = (): React.ReactElement => {
  const map: kakao.maps.Map = useMap()
  const [nodes, setNodes] = useState<Array<NodeType>>([])
  const [edges, setEdges] = useState<Array<EdgeType>>([])
  const [level, setLevel] = useState<number>(1)
  const [controls, setControls] = useControlState()
  const [editMode, setEditMode] = useState<string>()
  const [selected, setSelected] = useState<Array<string>>([])
  const [cursorPos, setCursorPos] = useState<NodeType>()

  const isSelected = useCallback(
    (id: string) => selected.indexOf(id) !== -1,
    [selected]
  )

  const selectedNode = useMemo((): NodeType | null => {
    const node = nodes.filter(({ key }) => isSelected(key))
    return node.length > 0 ? node[0] : null
  }, [nodes, isSelected])

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  useEffect(() => {
    // update edge to sync up
    setEdges((prev) =>
      prev.filter(
        ({ from, to }: EdgeType) =>
          nodes.indexOf(from) !== -1 && nodes.indexOf(to) !== -1
      )
    )
  }, [nodes, setEdges])

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

  const getNode = useCallback(
    (id: string): NodeType | null => {
      const node = nodes.filter(({ key }: NodeType) => key === id)
      return node.length > 0 ? node[0] : null
    },
    [nodes]
  )

  const exportJSON = useCallback((): Blob => {
    const keys: Array<string> = nodes.map(({ key }) => key)
    const keyToIndex = (key: string): number => keys.indexOf(key)
    const obj = {
      nodes: nodes.map(({ key, lat, lng }: NodeType) => ({
        id: keyToIndex(key),
        lat,
        lng,
        info: {},
      })),
      edges: edges.map(({ from, to }: EdgeType) => ({
        from: keyToIndex((from as NodeType).key),
        to: keyToIndex((to as NodeType).key),
      })),
    }
    const blob: Blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    })
    return blob
  }, [nodes, edges])

  useEffect(() => {
    // redeclare upload callback
    setControls((prev) => ({
      ...prev,
      editUpload: (evt: any) => {
        const files = evt.target.files
        if (!files || files.length < 1) {
          return
        }
        const file = files[0]
        const reader: FileReader = new FileReader()
        reader.addEventListener("load", (event: any) => {
          const result = event.target.result
          try {
            const { nodes, edges } = JSON.parse(result)
            const newNodes: Array<NodeType> = nodes.map(
              ({ id, lat, lng }: any) =>
                ({
                  key: `node-${id}`,
                  lat,
                  lng,
                } as NodeType)
            )
            setNodes(newNodes)
            setEdges(
              edges.map(
                ({ from, to }: any) =>
                  ({
                    from: newNodes[from] as NodeType,
                    to: newNodes[to] as NodeType,
                  } as EdgeType)
              )
            )
            console.log(nodes, edges)
          } catch {
            window.alert("Failed to parse JSON")
          }
        })
        reader.readAsText(file)
      },
    }))
    // redeclare download callback
    setControls((prev) => ({
      ...prev,
      editDownload: () => {
        const filename = "graph-" + new Date().toISOString() + ".json"
        saveFile(filename, exportJSON())
      },
    }))
  }, [exportJSON])

  useEffect(() => {
    console.log("selected", selected)
    if (selected.length >= 2) {
      const [fromID, toID] = selected
      const [from, to] = [getNode(fromID), getNode(toID)]
      if (from !== null && to !== null) {
        createEdge(from, to)
        setCursorPos(undefined)
        setSelected([])
      }
      return
    }
  }, [selected, getNode, setCursorPos])

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

  const onMapMouseMove = useCallback(
    (evt: any) => {
      const { latLng: loc } = evt
      if (editMode !== "link") {
        return
      }
      const lat = loc.getLat()
      const lng = loc.getLng()
      setCursorPos({ key: "cursor", lat, lng } as NodeType)
    },
    [editMode, setCursorPos]
  )

  useEffect(() => {
    map.setCursor("default")
    kakao.maps.event.addListener(map, "click", onMapClick)
    kakao.maps.event.addListener(map, "mousemove", onMapMouseMove)
    return () => {
      map.setCursor("")
      kakao.maps.event.removeListener(map, "click", onMapClick)
      kakao.maps.event.removeListener(map, "mousemove", onMapMouseMove)
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

  const GuideLine = useCallback(
    (): React.ReactElement => (
      <>
        {selectedNode && cursorPos && (
          <Polyline
            key={`edge-guide`}
            path={[selectedNode, cursorPos].map(({ lat, lng }: NodeType) => ({
              lat,
              lng,
            }))}
            strokeWeight={3}
            strokeColor="#db4040"
            strokeOpacity={1}
            strokeStyle="dashed"
          />
        )}
      </>
    ),
    [selectedNode, cursorPos]
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
      <GuideLine />
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
