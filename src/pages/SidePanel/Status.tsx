import React, { useCallback } from "react"

import Stack from "@mui/joy/Stack"
import Typography from "@mui/joy/Typography"

import Card from "../../components/AsideCard"
import { useStatusState, StatusState } from "../../providers/StatusProvider"

const dateToFormatString = (date: Date): string => {
  const options = {
    timeZone: "Asia/Seoul",
  }
  const dateString: string = new Intl.DateTimeFormat("ko-kr", {
    dateStyle: "full",
    ...options,
  }).format(date)
  const dayPeriod: string = new Intl.DateTimeFormat("ko-kr", {
    dayPeriod: "long",
    ...options,
  }).format(date)
  const timeFormat = new Intl.DateTimeFormat("ko-kr", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    ...options,
  }).format(date)
  const [hour, minute, sec] = timeFormat.split(" ")[1].split(":")
  const timeString: string = `${hour}시 ${minute}분`
  return [dateString, dayPeriod, timeString].join("\n")
}

const Status = () => {
  const [status, setStatus] = useStatusState()
  const { currentTime } = status as StatusState

  const CurrentTimeCard = useCallback(() => {
    if (currentTime === null) {
      return null
    }
    const date = new Date(currentTime)
    return (
      <Card>
        <Typography>{dateToFormatString(date)}</Typography>
      </Card>
    )
  }, [currentTime])

  return (
    <>
      <Stack spacing={2}>
        <CurrentTimeCard />
      </Stack>
    </>
  )
}

export default Status
