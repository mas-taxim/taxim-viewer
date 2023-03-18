import React, { useEffect, useState, useCallback } from "react"

import Dot from "../../components/Dot"
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import HailIcon from "@mui/icons-material/Hail"
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"
import { CustomOverlayMap, useMap } from "react-kakao-maps-sdk"

import { useControlState, ControlState } from "../../providers/ControlProvider"
import { useStatusState, StatusState } from "../../providers/StatusProvider"
import ViewerButtons from "./ViewerButtons"

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

const Viewer = (): React.ReactElement => {
  const [markerPositions, setMarkerPositions] = useState<Array<MarkerPosition>>(
    []
  )
  const [controls, setControls] = useControlState()
  const [status, setStatus] = useStatusState()
  const [level, setLevel] = useState<number>(1)
  const [runable, setRunable] = useState<boolean>(false)

  useEffect(() => {
    const { logs } = status as StatusState
    setRunable(logs && logs.length > 0)
  }, [status])

  const map = useMap()

  useEffect(() => {
    setLevel(map.getLevel())
  }, [map])

  const { viewRunning: running, viewSpeed: speed } = controls as ControlState
  const { logs } = status as StatusState

  useEffect(() => {
    console.log(controls)

    // 1 frame contains 60 secs
    const DEFAULT_TIMESTEP = 60 * 1000
    // 1 frame / 1000 ms
    const interval = DEFAULT_TIMESTEP / 60 / (speed || 1.0)
    console.log("info", interval, running, speed)

    if (!running) return

    const finish = () => {
      setControls((prev) => ({ ...prev, viewRunning: false }))
    }

    const logsOnPlay: Array<any> = [...logs]

    let timer: any = null
    ;(async () => {
      if (!logsOnPlay) return

      let index = 0
      const colors: ColorName = {}

      timer = setInterval(() => {
        if (index >= logsOnPlay.length) {
          finish()
          return
        }
        const { time, vehicles, tasks } = logsOnPlay[index]
        setStatus((prev) => ({ ...prev, currentTime: time }))
        index += 1

        const _vehicles = Array.from(vehicles || [])
        const _tasks = Array.from(tasks || [])

        _vehicles.forEach(({ name }: any) => {
          if (!(name in colors)) {
            colors[name] = randomColor()
          }
        })
        _tasks.forEach(({ id }: any) => {
          const name = `task-${id}`
          if (!(name in colors)) {
            colors[name] = randomColor()
          }
        })

        const vMarkers = _vehicles.map(({ name, lat, lng }: any) => ({
          key: name,
          color: colors[name],
          size: 5,
          lat,
          lng,
          type: MarkerType.VEHICLE,
        }))

        const tMarkers = _tasks
          .map(({ id, pick_lat, pick_lng, drop_lat, drop_lng }: any) => [
            {
              key: `task-${id}-pick`,
              color: colors[`task-${id}`],
              size: 4,
              lat: pick_lat,
              lng: pick_lng,
              type: MarkerType.PERSON_PICK,
            },
            {
              key: `task-${id}-drop`,
              color: colors[`task-${id}`],
              size: 4,
              lat: drop_lat,
              lng: drop_lng,
              type: MarkerType.PERSON_DROP,
            },
          ])
          .flat()

        setMarkerPositions([...vMarkers, ...tMarkers])
      }, interval)
    })()
    return () => {
      clearInterval(timer)
      finish()
    }
  }, [running])

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
        running={false}
        runable={runable}
        onClickPlay={() => {
          console.log("play")
          return false
        }}
        onClickUpload={(evt: React.ChangeEvent<HTMLInputElement>) => {
          const files = evt.target.files
          if (!files || files.length < 1) {
            setRunable(false)
            return
          }
          const file = files[0]
          const reader: FileReader = new FileReader()
          reader.addEventListener("load", (event: any) => {
            const result = event.target.result
            try {
              const { logs } = JSON.parse(result)
              setStatus((prev) => ({ ...prev, logs }))
              setRunable(true)
            } catch {
              window.alert("Wrong JSON file format")
              setRunable(false)
            }
          })
          reader.readAsText(file)
        }}
      />
    </>
  )
}

export default Viewer
