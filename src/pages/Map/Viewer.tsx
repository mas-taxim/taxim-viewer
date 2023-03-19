/* global kakao */

import React, { useEffect, useState, useCallback, useRef } from "react"

import Dot from "../../components/Dot"
import Aside from "../../components/Aside"

import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import HailIcon from "@mui/icons-material/Hail"
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"
import { Divider, Stack, Typography } from "@mui/joy"

import { CustomOverlayMap, useMap } from "react-kakao-maps-sdk"

import { useStatusState, StatusState } from "../../providers/StatusProvider"
import ViewerButtons from "./Controls/ViewerButtons"
import { humanizeDate } from "../../helpers/stringFormat"

const MarkerType = {
  NONE: -1,
  VEHICLE: 0,
  PERSON_PICK: 1,
  PERSON_DROP: 2,
}

type MarkerPosition = {
  key: string | null
  color?: string
  size: number
  lat: number
  lng: number
  type: number
}

interface ColorName {
  [key: string]: string
}

const randomColor = () => "#" + Math.random().toString(16).slice(-6)

type TaskType = {
  id: number
  drop_lat: number
  drop_lng: number
  pick_lat: number
  pick_lng: number
  status: number
  time: number
}

const Viewer = (): React.ReactElement => {
  const [markerPositions, setMarkerPositions] = useState<Array<MarkerPosition>>(
    []
  )
  const [status, setStatus] = useStatusState()
  const [level, setLevel] = useState<number>(3)
  const [runable, setRunable] = useState<boolean>(false)
  const [running, setRunning] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1.0)
  const [progressMax, setProgressMax] = useState<number>(0)
  const [progressCurrent, setProgressCurrent] = useState<number>(0)
  const [allColors, setColors] = useState<ColorName>({})

  useEffect(() => {
    const { logs } = status as StatusState
    setRunable(logs && logs.length > 0)
  }, [status])

  const map = useMap()

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  const { logs } = status as StatusState

  const displayTimeAt = useCallback(
    (t: number) => {
      if (!logs || t >= logs.length) return

      const { time, vehicles, tasks } = logs[t]

      const vMarkers: Array<MarkerPosition> = Array.from(vehicles || []).map(
        ({ name, lat, lng }: any) => ({
          key: name,
          color: allColors[name],
          size: 5,
          lat,
          lng,
          type: MarkerType.VEHICLE,
        })
      )

      const tMarkers: Array<MarkerPosition> = Array.from(tasks || [])
        .map(
          ({
            id,
            pick_lat,
            pick_lng,
            drop_lat,
            drop_lng,
            status,
          }: any): any[] => [
            0 <= status && status <= 5
              ? {
                  key: `task-${id}-pick`,
                  color: allColors[`task-${id}`],
                  size: 4,
                  lat: pick_lat,
                  lng: pick_lng,
                  type: MarkerType.PERSON_PICK,
                }
              : null,
            {
              key: `task-${id}-drop`,
              color: allColors[`task-${id}`],
              size: 4,
              lat: drop_lat,
              lng: drop_lng,
              type: MarkerType.PERSON_DROP,
            },
          ]
        )
        .flat()
        .filter((value) => value !== null)

      setMarkerPositions([...vMarkers, ...tMarkers])
    },
    [logs]
  )

  useEffect(() => {
    displayTimeAt(progressCurrent)
  }, [progressCurrent])

  useEffect(() => {
    if (!running) return

    // 1 frame contains 60 secs
    const DEFAULT_TIMESTEP = 60 * 1000
    // 1 frame / 1000 ms
    const interval = DEFAULT_TIMESTEP / 60 / (speed || 1.0)
    console.log("info", interval, running, speed)

    const timer = setTimeout(() => {
      setProgressCurrent((prev) => prev + 1)
    }, interval)

    return () => {
      clearTimeout(timer)
    }
  }, [running, speed, progressCurrent])

  const fitMapBound = useCallback(
    (nodes: Array<{ lat: number; lng: number }>) => {
      if (nodes.length < 1) return
      const bounds = new kakao.maps.LatLngBounds()
      nodes.forEach(({ lat, lng }) => {
        bounds.extend(new kakao.maps.LatLng(lat, lng))
      })
      map.setBounds(bounds)
    },
    [map]
  )

  useEffect(() => {
    if (!logs || logs.length < 1) return

    const positions = logs
      .map(({ vehicles, tasks }: any) =>
        vehicles
          .map(({ lat, lng }: any) => ({ lat, lng }))
          .concat(
            ...tasks.map(({ pick_lat, pick_lng, drop_lat, drop_lng }: any) => [
              {
                lat: pick_lat,
                lng: pick_lng,
              },
              {
                lat: drop_lat,
                lng: drop_lng,
              },
            ])
          )
      )
      .flat()

    // collect and create pairs of name and color
    const nameKeyValueMap: ColorName = [
      ...Array.from(
        new Set<string>(
          logs
            .map(({ vehicles, tasks }: any) =>
              vehicles
                .map(({ name }: any) => `${name}`)
                .concat(tasks.map(({ id }: any) => `${id}`))
            )
            .flat()
        )
      ),
    ]
      .map((name: string) => ({
        [name]: randomColor(),
      }))
      .reduce(
        (
          previousValue: { [x: string]: string },
          currentValue: { [x: string]: string }
        ) => ({
          ...previousValue,
          ...currentValue,
        }),
        {}
      )

    setColors(nameKeyValueMap)
    setProgressMax(logs.length - 1)
    fitMapBound(positions)
    displayTimeAt(0)
  }, [logs, fitMapBound, displayTimeAt])

  const displayIcon = useCallback((iconType: number) => {
    const iconStyle = {
      fill: "white",
      marginTop: "-1px",
      width: "75%",
    }
    if (iconType == MarkerType.NONE) {
      return <></>
    } else if (iconType == MarkerType.VEHICLE) {
      return <LocalTaxiIcon style={iconStyle} />
    } else if (iconType == MarkerType.PERSON_PICK) {
      return <HailIcon style={iconStyle} />
    } else if (iconType == MarkerType.PERSON_DROP) {
      return <KeyboardDoubleArrowDownIcon style={iconStyle} />
    }
  }, [])

  const loadLogFromFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files
    if (!files || files.length < 1) {
      return
    }
    const file = files[0]
    const reader: FileReader = new FileReader()
    reader.addEventListener("load", (event: any) => {
      const result = event.target.result
      try {
        const { logs } = JSON.parse(result)
        setStatus((prev) => ({ ...prev, logs }))
      } catch {
        window.alert("Wrong JSON file format")
      }
    })
    reader.readAsText(file)
  }

  const sidePanelRef = useRef(null)

  useEffect(() => {
    if (!sidePanelRef || !sidePanelRef.current) return
    const div: HTMLDivElement = sidePanelRef.current
    div.scrollTo({ top: div.scrollHeight })
  }, [sidePanelRef, progressCurrent])

  const StateViewer = useCallback((): React.ReactElement => {
    if (!logs || logs.length < 1) {
      return <></>
    }

    const sublogs: Array<{
      time: number
      vehicles: Array<any>
      tasks: Array<any>
    }> = logs.slice(0, progressCurrent + 1)

    return (
      <>
        {sublogs.map(({ time, vehicles, tasks }) => (
          <div key={`log-${time}`}>
            <Divider>
              <Typography color="neutral" fontSize={2}>
                {humanizeDate(new Date(time))}
              </Typography>
            </Divider>
          </div>
        ))}
      </>
    )
  }, [logs, progressCurrent])

  return (
    <>
      {markerPositions.map(
        ({ key, color, size, lat, lng, type }: MarkerPosition) => (
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
            <Dot color={color || "dodgerblue"} size={size / level}>
              {displayIcon(type)}
            </Dot>
          </CustomOverlayMap>
        )
      )}
      <ViewerButtons
        running={running}
        runable={runable}
        progressMax={progressMax}
        progressCurrent={progressCurrent}
        speed={speed}
        onSelectSpeed={setSpeed}
        onProgressUpdated={setProgressCurrent}
        onClickPlay={() => setRunning(!running)}
        onClickUpload={loadLogFromFile}
      />

      <Aside ref={sidePanelRef}>
        <Stack spacing={1}>
          <StateViewer />
        </Stack>
      </Aside>
    </>
  )
}

export default Viewer
