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

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST as string
const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000
const START_YEAR = 2020
const START_MONTH = 8
const START_DAY = 29
const START_HOURS = 6
const START_MINUTES = 0
const TICKS_MS = 500
const STEP_JUMP_MINS = 10
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

type HeaderCellType = {
  id: string
  title: string
  start: Date
  end: Date
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

const Timeline = () => {
  const [snapshot, setSnapshot] = useState<SnapshotType>()
  const [range, setRange] = useState<TimeRange>({
    start: new Date(),
    current: new Date(),
    end: new Date(),
  })
  const [mins, setMinutes] = useState<number>(START_HOURS * 60 + START_MINUTES)
  const [terminated, setTerminated] = useState<boolean>(false)

  const stepable = (minutes: number): boolean => {
    const startDate = new Date(START_YEAR, START_MONTH - 1, START_DAY)
    const curDate = timedelta(startDate, minutes * 60 * 1000)
    return startDate.toLocaleDateString() == curDate.toLocaleDateString()
  }

  // step minute after TICKS if possible
  useEffect(() => {
    let timer: any = null
    if (!terminated) {
      timer = setTimeout(() => {
        setMinutes((currentMin: number) => {
          const nextMin = currentMin + STEP_JUMP_MINS
          const available = stepable(nextMin)
          if (!available) {
            setTerminated(true)
            return currentMin
          } else {
            return nextMin
          }
        })
      }, TICKS_MS)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [mins, terminated])

  const fetchSnapshot = useCallback(
    (
      year: number,
      month: number,
      day: number,
      hour: number,
      minutes: number,
      vehicles: number,
      tasks: number
    ) =>
      fetch(
        `${SERVER_HOST}/schedule/${year}/${month}/${day}/${hour}/${minutes}?vehicles=${vehicles}&tasks=${tasks}`
      )
        .then((r) => r.json())
        .catch((e) => {
          window.alert("Connection failed")
          console.error(e)
          setTerminated(true)
        })
        .then(setSnapshot),
    [setTerminated, setSnapshot]
  )

  useEffect(() => {
    if (terminated) return
    const hour = Math.floor(mins / 60)
    const minutes = mins % 60
    const vehicles = 2
    const tasks = 30
    fetchSnapshot(
      START_YEAR,
      START_MONTH,
      START_DAY,
      hour,
      minutes,
      vehicles,
      tasks
    )
  }, [mins, terminated, fetchSnapshot])

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
