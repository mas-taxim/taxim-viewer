import React, { useCallback, useState, useEffect } from "react"

const EXAMPLE_JSON_URL =
  "https://gist.githubusercontent.com/joonas-yoon/4007b06b09685baaa4a456d3eb236e5a/raw/ae8044bf161a08317a38db9d9f35253b1112cfce/example_schedules.json"

type ScheduleTimeType = {
  load_time: string
  start_time: string
  status: number
  task_id: number
  unload_time: string
}

type SnapshotType = {
  time: number
  logs: Array<{ vehicle_id: string; schedules: Array<ScheduleTimeType> }>
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

  return (
    <>
      <div></div>
    </>
  )
}

export default Timeline
