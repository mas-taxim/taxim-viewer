export const humanizeDate = (date: Date): string => {
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
