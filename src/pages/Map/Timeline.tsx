import React, {
  useCallback,
  useState,
  useEffect,
  CSSProperties,
  useMemo,
} from "react"
// @ts-ignore
import ExternalTimeline from "react-timelines"
import styled from "styled-components"
import "react-timelines/lib/css/style.css"
import "./timeline-overrides.css"
import { useDynamicFetch } from "../../hooks"

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST as string
const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000
const COLUMN_GAP = 10 * 60 * 1000 // 10 min

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

const DEFAULT_TRACK_STYLE: CSSProperties = {
  backgroundColor: "#dcdc33",
  color: "#1f1f1f",
  borderRadius: "4px",
  boxShadow: "1px 1px 0px rgba(0, 0, 0, 0.25)",
}

const STATUS_FINISHED = 0
const STATUS_WORKING = 1
const STATUS_WAITING = 2

const trackStyleByStatus = (status: number): CSSProperties => {
  if (status === STATUS_FINISHED) {
    return {
      color: "white",
      backgroundColor: "gray",
      opacity: 0.5,
    }
  }
  if (status === STATUS_WORKING) {
    return {
      color: "white",
      backgroundColor: "#0a6bde",
    }
  }
  if (status === STATUS_WAITING) {
    return {
      color: "white",
      backgroundColor: "#dcdc33",
    }
  }
  return {}
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
        title: `#${task_id}`,
        start: new Date(start_time),
        end: new Date(unload_time),
        style: { ...DEFAULT_TRACK_STYLE, ...trackStyleByStatus(status) },
      })
    ),
    tracks: [],
  }
}

type TimeRange = {
  start: Date
  current: Date
  end: Date
}

const timedelta = (date: Date, delta: number): Date =>
  new Date(date.getTime() + delta)

const EmptyMessageStyled = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #9f9f9f;
`

type TimelineProps = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const Timeline = ({ year, month, day, hour, minute }: TimelineProps) => {
  const [snapshot, setSnapshot] = useState<SnapshotType>()
  const [range, setRange] = useState<TimeRange>({
    start: new Date(),
    current: new Date(),
    end: new Date(),
  })
  const [terminated, setTerminated] = useState<boolean>(false)

  const stepable = (minutes: number): boolean => {
    const startDate = new Date(year, month - 1, day)
    const curDate = timedelta(startDate, minutes * 60 * 1000)
    return startDate.toLocaleDateString() == curDate.toLocaleDateString()
  }

  useEffect(() => {
    setTerminated(!stepable(minute))
  }, [minute])

  const [response, requestSchedule] = useDynamicFetch()

  useEffect(() => {
    if (terminated) return
    const vehicles = 10
    const tasks = 130
    const url = `${SERVER_HOST}/schedule/${year}/${month}/${day}/${hour}/${minute}?vehicles=${vehicles}&tasks=${tasks}`
    requestSchedule(url)
  }, [year, month, day, hour, minute, terminated])

  useEffect(() => {
    if (!response) return
    setSnapshot(response.data as SnapshotType)
  }, [response])

  useEffect(() => {
    console.log("snapshot", snapshot)
    if (!snapshot || !snapshot.time) {
      setTerminated(true)
      return
    }
    const now = new Date(snapshot.time)
    setRange({
      start: timedelta(now, -3 * 3600 * 1000),
      current: now,
      end: timedelta(now, 9 * 3600 * 1000),
    })
    setTerminated(false)
  }, [snapshot])

  const timebar = useMemo(() => {
    const { start, current, end } = range
    const COLUMNS = (end.getTime() - start.getTime()) / COLUMN_GAP
    console.log("start", start)
    console.log("end", end)

    return [
      {
        id: "minutes",
        title: current.toLocaleTimeString(),
        cells: [...Array(COLUMNS)].map((_, index) => {
          const time = timedelta(start, COLUMN_GAP * index)
          const end = timedelta(time, COLUMN_GAP)
          const minute = time.getMinutes()
          return {
            id: `header-m-${time.getTime()}`,
            title: "",
            start: time,
            end,
            style:
              minute == current.getMinutes()
                ? {
                    backgroundColor: "black",
                  }
                : {},
          }
        }),
        useAsGrid: true,
        style: {},
      },
    ]
  }, [range])

  const Result = useCallback(
    () =>
      snapshot && snapshot.logs ? (
        <ExternalTimeline
          scale={{
            start: range.start,
            end: range.end,
            zoom: 11,
          }}
          timebar={timebar}
          tracks={snapshot.logs.map(createTracksByVehicle)}
          now={range.current}
          enableSticky
        />
      ) : (
        <EmptyMessageStyled>No Data</EmptyMessageStyled>
      ),
    [snapshot, timebar]
  )

  return <Result />
}

export default Timeline
