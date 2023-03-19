/* global kakao */

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  CSSProperties,
} from "react"

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
import styled from "styled-components"

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

const LogIcon = ({ color, style, children }: any): React.ReactElement => (
  <div
    style={{
      backgroundColor: color || "black",
      display: "flex",
      justifyItems: "center",
      alignItems: "center",
      width: "32px",
      height: "32px",
      borderRadius: "6rem",
      ...style,
    }}
  >
    <>{children}</>
  </div>
)

const VehicleLogInfoStyled = styled.div`
  width: calc(100% - 12px);
  position: relative;
  box-sizing: border-box;
  padding: 0 6px;
  display: flex;
  align-items: center;
`

const RoadLineStyled = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;
  background-color: #efefef;
  border-radius: 1em;
  z-index: 0;
`

type DisplayIconProps = {
  type: number
  style?: CSSProperties
}

const Icon = ({ type, style = {} }: DisplayIconProps): any => {
  const iconStyle = {
    fill: "white",
    marginTop: "-1px",
    width: "75%",
    ...style,
  }
  if (type == MarkerType.NONE) {
    return <></>
  } else if (type == MarkerType.VEHICLE) {
    return <LocalTaxiIcon style={iconStyle} />
  } else if (type == MarkerType.PERSON_PICK) {
    return <HailIcon style={iconStyle} />
  } else if (type == MarkerType.PERSON_DROP) {
    return <KeyboardDoubleArrowDownIcon style={iconStyle} />
  }
}

const LogInfoStyled = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: 0.5rem 0;
`

const get_slope_weight = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number
) => {
  const lx = Math.abs(x2 - x1)
  const ly = Math.abs(y2 - y1)
  const dx = cx - x1
  const dy = cy - y1
  const r = Math.sqrt(dx * dx + dy * dy) / Math.sqrt(lx * lx + ly * ly)
  return Math.max(0.0, Math.min(r * 100.0, 100.0))
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
    },
    [logs, allColors]
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
    setTimeout(() => {
      div.scrollTo({ top: div.scrollHeight, behavior: "smooth" })
    }, 100)
  }, [sidePanelRef, progressCurrent])

  const LogInfo = useCallback(({ time, vehicles, tasks, colors }: any) => {
    return (
      <>
        {vehicles
          .filter(({ allocated_id }: any) => allocated_id != null)
          .map(({ name, lat, lng, allocated_id }: any) => {
            const task = Array.from(tasks || []).filter(
              ({ id }: any) => id === allocated_id
            )
            if (task.length < 1) return null
            const {
              id,
              status,
              pick_lat,
              pick_lng,
              drop_lat,
              drop_lng,
            }: TaskType = task[0] as TaskType

            const isPicked = status > 5
            const isDroped = status > 6

            const IconReadyStyle = {
              backgroundColor: "transparent",
              borderWidth: "1px",
              borderColor: colors[id],
              borderStyle: "dashed",
            }

            const IconReadyInnerStyle = {
              fill: colors[id],
            }

            return (
              <LogInfoStyled className="pairs" key={`pair-of-${time}-${id}`}>
                <LogIcon
                  color={status <= 5 ? "transparent" : colors[id]}
                  style={{
                    justifySelf: "flex-start",
                    ...(isPicked ? {} : IconReadyStyle),
                  }}
                >
                  <Icon
                    type={MarkerType.PERSON_PICK}
                    style={{
                      margin: "0 auto",
                      ...(isPicked ? {} : IconReadyInnerStyle),
                    }}
                  />
                </LogIcon>
                <VehicleLogInfoStyled>
                  <RoadLineStyled
                    style={isPicked ? { backgroundColor: colors[id] } : {}}
                  />
                  <div
                    style={{
                      position: "absolute",
                      width: "calc(100% - 32px)",
                      top: 0,
                    }}
                  >
                    <LogIcon
                      color={colors[name]}
                      style={{
                        position: "absolute",
                        left: `${get_slope_weight(
                          pick_lat,
                          pick_lng,
                          drop_lat,
                          drop_lng,
                          lat,
                          lng
                        )}%`,
                        zIndex: 1,
                      }}
                    >
                      <Icon
                        type={MarkerType.VEHICLE}
                        style={{
                          margin: "0 auto",
                        }}
                      />
                    </LogIcon>
                  </div>
                </VehicleLogInfoStyled>
                <LogIcon
                  color={colors[id]}
                  style={{
                    justifySelf: "flex-end",
                    ...(isDroped ? {} : IconReadyStyle),
                  }}
                >
                  <Icon
                    type={MarkerType.PERSON_DROP}
                    style={{
                      margin: "0 auto",
                      ...(isDroped ? {} : IconReadyInnerStyle),
                    }}
                  />
                </LogIcon>
              </LogInfoStyled>
            )
          })}
      </>
    )
  }, [])

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

  const StateViewer = useCallback((): React.ReactElement => {
    if (!subLogs || subLogs.length < 1) {
      return (
        <center
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
          }}
        >
          <Typography
            color="neutral"
            fontSize={2}
            sx={{
              translate: "0% -50%",
              textAlign: "center",
            }}
          >
            재생할 정보가 없습니다.
          </Typography>
        </center>
      )
    }
    return (
      <Stack spacing={1}>
        {subLogs.map(({ time, vehicles, tasks }) => (
          <div key={`log-${time}`}>
            <Divider
              sx={{
                marginTop: "0.5rem",
                marginBottom: "0.25rem",
              }}
            >
              <Typography color="neutral" fontSize={2}>
                {humanizeDate(new Date(time))}
              </Typography>
            </Divider>
            <LogInfo
              time={time}
              vehicles={vehicles}
              tasks={tasks}
              colors={allColors}
            />
          </div>
        ))}
      </Stack>
    )
  }, [subLogs, allColors])

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

      <Aside ref={sidePanelRef}>
        <StateViewer />
      </Aside>
    </>
  )
}

export default Viewer
