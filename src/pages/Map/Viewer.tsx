/* global kakao */

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  CSSProperties,
} from "react"

import Dot from "../../components/Dot"
import Aside from "../../components/Aside"

import { CustomOverlayMap, useMap } from "react-kakao-maps-sdk"

import { useStatusState, StatusState } from "../../providers/StatusProvider"
import ViewerButtons from "./Controls/ViewerButtons"
import { randomDarkColor } from "../../helpers/colors"
import { default as PanelViewByVehicle } from "./ViewerPanel/ByVehicle"
// import { ColorName, VehicleState, TaskType, MarkerType } from "./defines"
import { Icon } from "./components"
import styled from "styled-components"

import {
  MarkerType,
  MarkerPosition,
  ColorName,
  VehicleState,
  TaskType,
} from "./defines"

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
  const [logs, setLogs] = useState<Array<any>>([])
  const [vehiclesState, setVehiclesState] = useState<Map<string, VehicleState>>(
    new Map()
  )

  useEffect(() => {
    const { logs } = status as StatusState
    setRunable(logs && logs.length > 0)
    setLogs(logs)
    setProgressCurrent(0)
  }, [status])

  const map = useMap()

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  useEffect(() => {
    map.setLevel(level)
  }, [map, level])

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
                  color: allColors[id],
                  size: 4,
                  lat: pick_lat,
                  lng: pick_lng,
                  type: MarkerType.PERSON_PICK,
                }
              : null,
            {
              key: `task-${id}-drop`,
              color: allColors[id],
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
      setVehiclesState((prev: Map<string, VehicleState>) => {
        const newState = new Map(prev)
        for (const vehicle of Array.from(vehicles || [])) {
          const { name } = vehicle as VehicleState
          newState.set(name, vehicle as VehicleState)
        }
        return newState
      })
    },
    [logs, allColors]
  )

  useEffect(() => {
    if (!logs) return
    setVehiclesState((prev: Map<string, VehicleState>) => {
      const nameCollected: string[] = Array.from(
        new Set<string>(
          logs
            .map(({ vehicles }: any) =>
              vehicles.map((v: any): string => v.name || "")
            )
            .reduce((prev, curr) => [...prev, ...curr], [])
        )
      )

      const newMap = new Map(prev)
      for (const name of nameCollected) {
        // add empty values having name only
        newMap.set(name, {
          name,
          lat: -1,
          lng: -1,
          allocated_id: null,
        } as VehicleState)
      }
      return newMap
    })
  }, [logs])

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
            ...tasks.map(
              ({ pick_lat, pick_lng, drop_lat, drop_lng }: TaskType) => [
                {
                  lat: pick_lat,
                  lng: pick_lng,
                },
                {
                  lat: drop_lat,
                  lng: drop_lng,
                },
              ]
            )
          )
      )
      .flat()

    setProgressMax(logs.length - 1)
    fitMapBound(positions)
    displayTimeAt(0)
  }, [logs, fitMapBound, displayTimeAt])

  useEffect(() => {
    if (!logs || logs.length < 1) return

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
        [name]: randomDarkColor(),
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
  }, [logs])

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
        displayTimeAt(0)
      } catch {
        window.alert("Wrong JSON file format")
      }
    })
    reader.readAsText(file)
  }

  const [subLogs, setSubLogs] = useState<Array<any>>([])

  useEffect(() => {
    if (!logs || logs.length < 1) return
    const sliced: Array<{
      time: number
      vehicles: Array<any>
      tasks: Array<any>
    }> = logs.slice(0, progressCurrent + 1)
    setSubLogs(sliced)
  }, [logs, progressCurrent])

  const PanelViewByVehicleMemo = useMemo(
    (): React.ReactElement => (
      <PanelViewByVehicle
        logs={subLogs}
        vehiclesState={vehiclesState}
        colors={allColors}
      />
    ),
    [subLogs, vehiclesState, allColors]
  )

  return (
    <>
      {markerPositions.map(
        ({ key, color, size, lat, lng, type }: MarkerPosition) => (
          <CustomOverlayMap
            key={`marker-${key}`}
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
              <Icon type={type as number} />
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

      <Aside>{PanelViewByVehicleMemo}</Aside>
    </>
  )
}

export default Viewer
