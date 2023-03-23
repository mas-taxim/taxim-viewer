/* global kakao */

import React, { useEffect, useState, useCallback, useMemo } from "react"

import Point from "../../components/Point"
import EditorButtons from "./Controls/EditorButtons"
import { jsonToBlob, saveFile } from "../../helpers/fileInteracts"

import { CustomOverlayMap, useMap, Polyline } from "react-kakao-maps-sdk"

type NodeType = {
  key: string
  lat: number
  lng: number
}

type EdgeType = {
  from: string
  to: string
}

const saveGraphFile = (
  nodes: Array<NodeType>,
  edges: Array<EdgeType>
): void => {
  const keys: Array<string> = nodes.map(({ key }) => key)
  const keyToIndex = (key: string): number => keys.indexOf(key)
  const transformed = {
    nodes: nodes.map(({ key, lat, lng }: NodeType) => ({
      id: keyToIndex(key),
      lat,
      lng,
      info: {},
    })),
    edges: edges.map(({ from, to }: EdgeType) => ({
      from: keyToIndex(from),
      to: keyToIndex(to),
    })),
  }
  const filename = "graph-" + new Date().toISOString() + ".json"
  saveFile(filename, jsonToBlob(transformed))
}

const Editor = (): React.ReactElement => {
  const map: kakao.maps.Map = useMap()
  const [nodes, setNodes] = useState<Array<NodeType>>([])
  const [tmpNodes, _setTmpNodes] = useState<Array<NodeType>>([])
  const [edges, setEdges] = useState<Array<EdgeType>>([])
  const [level, setLevel] = useState<number>(1)
  const [editMode, setEditMode] = useState<string>("add")
  const [selected, setSelected] = useState<Array<string>>([])
  const [cursorPos, setCursorPos] = useState<NodeType>()

  const compactNodes = (_nodes: Array<NodeType>) => {
    if (_nodes.length > 1000) {
      console.warn("Too much nodes to display over 5k")
      return _nodes.slice(0, 1000)
    }
    return _nodes
  }

  const setTmpNodes = useCallback(
    (newNodes: Array<NodeType>) => {
      // node
      const bounds = map.getBounds()
      const [ne, sw] = [bounds.getNorthEast(), bounds.getSouthWest()]
      const top = sw.getLat()
      const left = sw.getLng()
      const bottom = ne.getLat()
      const right = ne.getLng()
      const nodesInBounds = newNodes.filter(
        ({ lat, lng }: NodeType): boolean =>
          top <= lat && lat <= bottom && left <= lng && lng <= right
      )
      const compactedNodes = compactNodes(nodesInBounds)
      console.log("Bounds:", top, left, bottom, right)
      console.log("Set New Temporal Nodes", compactedNodes, nodesInBounds)
      _setTmpNodes(nodesInBounds)
    },
    [map]
  )

  const isSelected = useCallback(
    (id: string) => selected.indexOf(id) !== -1,
    [selected]
  )

  const selectedNode = useMemo((): NodeType | null => {
    const node = nodes.filter(({ key }) => isSelected(key))
    return node.length > 0 ? node[0] : null
  }, [nodes, isSelected])

  const createEdge = (from: NodeType, to: NodeType) => {
    setEdges((prev) =>
      prev
        .filter((edge) => !(edge.from == from.key && edge.to == to.key))
        .concat({
          from: from.key,
          to: to.key,
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

  const hasNode = useCallback(
    (id: string): boolean => getNode(id) !== null,
    [getNode]
  )

  useEffect(() => {
    setLevel(map.getLevel())
    setTimeout(() => {
      map.relayout()
    }, 0)
  }, [map])

  useEffect(() => {
    // update edge to sync up
    setEdges((prev) =>
      prev.filter(({ from, to }: EdgeType) => hasNode(from) && hasNode(to))
    )
  }, [hasNode, setEdges])

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

  const onMapClick = useCallback(
    (evt: any) => {
      const { latLng: loc } = evt
      if (editMode !== "add") {
        return
      }
      const lat = loc.getLat()
      const lng = loc.getLng()
      console.log("Map Clicked", lat, lng)
      setNodes((prev) => {
        const nodeId = Math.random().toString(16).slice(2) as string
        const node = { key: `node-${nodeId}`, lat, lng } as NodeType
        console.log("add node", node)
        return [...prev, node]
      })
    },
    [editMode]
  )

  const onMapMouseUp = useCallback((evt: any) => {}, [])

  const onMapMouseMove = useCallback(
    (evt: any) => {
      const { latLng: loc } = evt
      const lat = loc.getLat()
      const lng = loc.getLng()
      if (editMode === "link") {
        setCursorPos({ key: "cursor", lat, lng } as NodeType)
      } else if (editMode === "move") {
        if (selected.length != 1) {
          return
        }
        setNodes((prev) =>
          prev.map((node: NodeType): NodeType => {
            if (selected[0] !== node.key) {
              return node
            } else {
              return { ...node, lat, lng }
            }
          })
        )
      }
    },
    [editMode, setNodes, selected, setCursorPos]
  )

  useEffect(() => {
    const updateNodes = () => setTmpNodes(nodes)
    kakao.maps.event.addListener(map, "idle", updateNodes)
    return () => {
      kakao.maps.event.addListener(map, "idle", updateNodes)
    }
  }, [map, nodes])

  useEffect(() => {
    setTmpNodes(nodes)
  }, [nodes])

  useEffect(() => {
    map.setCursor("default")
    kakao.maps.event.addListener(map, "click", onMapClick)
    kakao.maps.event.addListener(map, "mouseup", onMapMouseUp)
    kakao.maps.event.addListener(map, "mousemove", onMapMouseMove)
    return () => {
      map.setCursor("")
      kakao.maps.event.removeListener(map, "click", onMapClick)
      kakao.maps.event.removeListener(map, "mouseup", onMapMouseUp)
      kakao.maps.event.removeListener(map, "mousemove", onMapMouseMove)
    }
  }, [map, onMapClick, onMapMouseUp, onMapMouseMove])

  const onMouseDownPoint = useCallback(
    (evt: any) => {
      const container = evt.target.closest("[data-id]") as HTMLElement
      const id = container.getAttribute("data-id") as string
      const mouseType = evt.button as number
      if (editMode === "add") {
        if (mouseType === 2) {
          // right button
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
      } else if (editMode === "move") {
        if (mouseType === 0) {
          // left button to move
          setSelected((prev) => (prev.length > 0 ? [] : [id]))
        }
      }
    },
    [editMode, setNodes, setSelected]
  )

  const onMouseUpPoint = useCallback((evt: any) => {}, [])

  const guideLine = useMemo(
    (): React.ReactElement => (
      <>
        {editMode === "link" && selectedNode && cursorPos && (
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
    [editMode, selectedNode, cursorPos]
  )

  const NodePoints = useCallback((): React.ReactElement => {
    console.log("NodePoints", tmpNodes)
    return (
      <>
        {tmpNodes.map(
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
  }, [tmpNodes, level, isSelected, onMouseDownPoint, onMouseUpPoint])

  const EdgeLines = useCallback(
    (): React.ReactElement => (
      <>
        {edges.map(({ from, to }: EdgeType): React.ReactElement => {
          const path: Array<any> = [from, to]
            .map(getNode)
            .filter((n) => n !== null)
          if (path.length != 2) {
            return <></>
          }
          return (
            <Polyline
              key={`edge-${from}-${to}`}
              path={path.map(({ lat, lng }: NodeType) => ({
                lat,
                lng,
              }))}
              strokeWeight={3}
              strokeColor="#db4040"
              strokeOpacity={1}
              strokeStyle="solid"
            />
          )
        })}
      </>
    ),
    [edges, getNode]
  )

  const fitMapBound = useCallback(
    (nodes: NodeType[]) => {
      if (nodes.length < 1) return
      const bounds = new kakao.maps.LatLngBounds()
      nodes.forEach(({ lat, lng }) => {
        bounds.extend(new kakao.maps.LatLng(lat, lng))
      })
      map.setBounds(bounds)
      setTimeout(() => {
        map.relayout()
      }, 0)
    },
    [map]
  )

  const loadGraphFromFile = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
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
                  from: (newNodes[from] as NodeType).key,
                  to: (newNodes[to] as NodeType).key,
                } as EdgeType)
            )
          )
          fitMapBound(nodes)
          // console.log(nodes, edges)
        } catch {
          window.alert("Failed to parse JSON")
        }
      })
      reader.readAsText(file)
    },
    [setNodes, setEdges]
  )

  const downloadGraphToFile = useCallback(
    () => saveGraphFile(nodes, edges),
    [nodes, edges]
  )

  return (
    <>
      <EdgeLines />
      {guideLine}
      <NodePoints />
      <EditorButtons
        editMode={editMode || "add"}
        onClickDownload={downloadGraphToFile}
        onClickUpload={loadGraphFromFile}
        onModeChanged={setEditMode}
      />
    </>
  )
}

export default Editor
