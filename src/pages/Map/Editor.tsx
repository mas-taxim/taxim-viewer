/* global kakao */

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"

import GrainIcon from "@mui/icons-material/Grain"
import PolylineIcon from "@mui/icons-material/Polyline"
import OpenWithIcon from "@mui/icons-material/OpenWith"
import UploadIcon from "@mui/icons-material/Upload"
import DownloadIcon from "@mui/icons-material/Download"

import Point from "../../components/Point"
import IconButton from "../../components/IconButton"
import HorizontalContainer, {
  Divider,
} from "../../components/HorizontalContainer"
import { useControlState, ControlState } from "../../providers/ControlProvider"

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

type MenuButtonProps = {
  title: string
  active?: boolean
  icon: React.ReactElement
  onClick: () => void
}

const MenuButton = ({
  title,
  active = false,
  icon,
  onClick,
}: MenuButtonProps) => {
  return (
    <IconButton
      tooltip={title}
      tooltipColor="primary"
      tooltipPlacement="top"
      active={active}
      variant="outlined"
      size={"32px"}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  )
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
  }, [map])

  useEffect(() => {
    // update edge to sync up
    setEdges((prev) =>
      prev.filter(({ from, to }: EdgeType) => hasNode(from) && hasNode(to))
    )
  }, [hasNode, setEdges])

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
        from: keyToIndex(from),
        to: keyToIndex(to),
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
                    from: (newNodes[from] as NodeType).key,
                    to: (newNodes[to] as NodeType).key,
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
  }, [(controls as ControlState).editMode])

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

  const GuideLine = useCallback(
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

  const onSelectMode = (editMode: string) => {
    setEditMode(editMode)
  }

  const ModeButtons = useCallback((): React.ReactElement => {
    return (
      <>
        <MenuButton
          title="점 추가/삭제"
          active={editMode === "add"}
          icon={<GrainIcon />}
          onClick={() => onSelectMode("add")}
        />
        <MenuButton
          title="점 연결"
          active={editMode === "link"}
          icon={<PolylineIcon />}
          onClick={() => onSelectMode("link")}
        />
        <MenuButton
          title="점 이동"
          active={editMode === "move"}
          icon={<OpenWithIcon />}
          onClick={() => onSelectMode("move")}
        />
      </>
    )
  }, [editMode])

  const UploadButton = useCallback((): React.ReactElement => {
    const ref = useRef<HTMLInputElement>(null)
    return (
      <>
        <label
          htmlFor="upload-log"
          style={{
            width: "100%",
          }}
        >
          <input
            ref={ref}
            style={{ display: "none" }}
            id="upload-log"
            name="upload-log"
            type="file"
            accept=".json,application/json"
            onChange={controls.editUpload}
          />
          <MenuButton
            title="업로드"
            icon={<UploadIcon />}
            onClick={() => {
              if (ref.current) {
                ref.current.click()
              }
            }}
          />
        </label>
      </>
    )
  }, [controls])

  const DownloadButton = useCallback(
    (): React.ReactElement => (
      <MenuButton
        title="다운로드"
        icon={<DownloadIcon />}
        onClick={() => {
          if (controls.editDownload) {
            controls.editDownload()
          }
        }}
      />
    ),
    [controls]
  )

  const NodePoints = useCallback(
    (): React.ReactElement => (
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
                selected={isSelected(key)}
                onMouseDown={onMouseDownPoint}
                onMouseUp={onMouseUpPoint}
              />
            </CustomOverlayMap>
          )
        )}
      </>
    ),
    [nodes, level, isSelected, onMouseDownPoint, onMouseUpPoint]
  )

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
              onCreate={console.log}
            />
          )
        })}
      </>
    ),
    [edges, getNode]
  )

  return (
    <>
      <EdgeLines />
      <GuideLine />
      <NodePoints />
      <HorizontalContainer position="bottom">
        <ModeButtons />
        <Divider />
        <UploadButton />
        <DownloadButton />
      </HorizontalContainer>
    </>
  )
}

export default Editor
