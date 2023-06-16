import React, { useCallback, useState, useEffect, CSSProperties } from "react"
// @ts-ignore
import ExternalTimeline from "react-timelines"
import "react-timelines/lib/css/style.css"
import "./timeline-overrides.css"

const EXAMPLE_JSON_URL =
  "https://gist.githubusercontent.com/joonas-yoon/4007b06b09685baaa4a456d3eb236e5a/raw/ae8044bf161a08317a38db9d9f35253b1112cfce/example_schedules.json"

type ServerScheduleTimeType = {
  load_time: string
  start_time: string
  status: number
  task_id: number
  unload_time: string
}

type ServerSnapshotLogType = {
  vehicle_id: string
  schedules: Array<ServerScheduleTimeType>
}

type SnapshotType = {
  time: number
  logs: ServerSnapshotLogType[]
}

type HeaderCellType = {
  id: string
  title: string
  start: Date
  end: Date
}

type TimelineTrackType = HeaderCellType & {
  style?: CSSProperties
}

const DEFAULT_TRACK_STYLE: CSSProperties = {
  backgroundColor: "#dcdc33",
  color: "#1f1f1f",
  borderRadius: "4px",
  boxShadow: "1px 1px 0px rgba(0, 0, 0, 0.25)",
}

const createTracksByVehicle = ({
  vehicle_id,
  schedules,
}: ServerSnapshotLogType) => {
  return {
    id: `tracks-for-${vehicle_id}`,
    title: vehicle_id,
    elements: schedules.map(
      ({
        load_time,
        start_time,
        status,
        task_id,
        unload_time,
      }: ServerScheduleTimeType) => ({
        id: `${vehicle_id}-track-${task_id}`,
        title: `${task_id}`,
        start: new Date(start_time),
        end: new Date(unload_time),
        style: { ...DEFAULT_TRACK_STYLE, color: "white" },
      })
    ),
    tracks: [],
  }
}

const Timeline = () => {
  const [snapshot, setSnapshot] = useState<SnapshotType>()

  useEffect(() => {
    fetch(EXAMPLE_JSON_URL)
      .then((r) => r.json())
      .then(setSnapshot)
  }, [])

  useEffect(() => {
    console.log("snapshot", snapshot)
  }, [snapshot])

  const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000
  const START = new Date("2023-02-02 00:00")
  const END = new Date("2023-02-03 00:00")
  const HEADER_INTERVAL = 3600 * 1000 // 1 hour
  const COLUMNS = (END.getTime() - START.getTime()) / HEADER_INTERVAL

  const cells: HeaderCellType[] = [...Array(COLUMNS)].map(
    (_, hour) =>
      ({
        id: `id-${hour}`,
        title: `${hour % 24}시`,
        start: new Date(START.getTime() + HEADER_INTERVAL * hour),
        end: new Date(START.getTime() + HEADER_INTERVAL * (hour + 1)),
      } as HeaderCellType)
  )

  console.log("cells", cells)

  const timebar = [
    {
      id: "hour",
      title: "Hour",
      cells: cells,
      useAsGrid: true,
      style: {},
    },
  ]

  const TimelineRender = useCallback(() => {
    if (!snapshot) {
      return <></>
    }

    const tracks = snapshot.logs.map(createTracksByVehicle)
    const now = new Date(snapshot.time + TIMEZONE_OFFSET)

    console.log("tracks", tracks)
    console.log("now", now)
    console.log("start", START)
    console.log("end", END)

    return (
      <ExternalTimeline
        scale={{
          start: START,
          end: END,
          zoom: 11,
          zoomMin: 2,
          zoomMax: 20,
        }}
        timebar={timebar}
        tracks={tracks}
        now={now}
      />
    )
  }, [snapshot])

  return <TimelineRender />
}

export default Timeline
