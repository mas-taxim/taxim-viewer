const START_YEAR = 2020
const NUM_OF_YEARS = 3
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const MONTHS_PER_YEAR = 12
const QUARTERS_PER_YEAR = 4
const MONTHS_PER_QUARTER = 3
const NUM_OF_MONTHS = NUM_OF_YEARS * MONTHS_PER_YEAR
const MAX_TRACK_START_GAP = 4
const MAX_ELEMENT_GAP = 8
const MAX_MONTH_SPAN = 8
const MIN_MONTH_SPAN = 2
const NUM_OF_TRACKS = 20
const MAX_NUM_OF_SUBTRACKS = 5
const COLORS = [
  "FF005D",
  "0085B6",
  "0BB4C1",
  "00D49D",
  "FEDF03",
  "233D4D",
  "FE7F2D",
  "FCCA46",
  "A1C181",
  "579C87",
]
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

const addMonthsToYear = (year: number, monthsToAdd: number) => {
  let y = year
  let m = monthsToAdd
  while (m >= MONTHS_PER_YEAR) {
    m -= MONTHS_PER_YEAR
    y += 1
  }
  return { year: y, month: m + 1 }
}

const addMonthsToYearAsDate = (year: number, monthsToAdd: number): Date => {
  const r = addMonthsToYear(year, monthsToAdd)
  return new Date(`${r.year}-${r.month}`)
}

export const buildQuarterCells = () => {
  const v = []
  for (let i = 0; i < QUARTERS_PER_YEAR * NUM_OF_YEARS; i += 1) {
    const quarter = (i % 4) + 1
    const startMonth = i * MONTHS_PER_QUARTER
    const s = addMonthsToYear(START_YEAR, startMonth)
    const e = addMonthsToYear(START_YEAR, startMonth + MONTHS_PER_QUARTER)
    v.push({
      id: `${s.year}-q${quarter}`,
      title: `Q${quarter} ${s.year}`,
      start: new Date(`${s.year}-${s.month}-01`),
      end: new Date(`${e.year}-${e.month}-01`),
    })
  }
  return v
}

export type HeaderCellType = {
  id: string
  title: string
  start: Date
  end: Date
}

export const buildMonthCells = (): HeaderCellType[] => {
  const v = []
  for (let i = 0; i < MONTHS_PER_YEAR * NUM_OF_YEARS; i += 1) {
    const startMonth = i
    const start = addMonthsToYearAsDate(START_YEAR, startMonth)
    const end = addMonthsToYearAsDate(START_YEAR, startMonth + 1)
    v.push({
      id: `m${startMonth}`,
      title: MONTH_NAMES[i % 12],
      start,
      end,
    } as HeaderCellType)
  }
  return v
}

type buildElementProps = {
  trackId: string
  start: Date
  end: Date
  i: number
}

export const buildElement = ({ trackId, start, end, i }: buildElementProps) => {
  const bgColor = randomColor()
  const color = "#ff33ff"
  return {
    id: `t-${trackId}-el-${i}`,
    title: `${trackId} #${i}`,
    start,
    end,
    style: {
      backgroundColor: `#${bgColor}`,
      color,
      borderRadius: "4px",
      boxShadow: "1px 1px 0px rgba(0, 0, 0, 0.25)",
      textTransform: "capitalize",
    },
  }
}

export const buildTrackStartGap = () =>
  Math.floor(Math.random() * MAX_TRACK_START_GAP)
export const buildElementGap = () => Math.floor(Math.random() * MAX_ELEMENT_GAP)

export const buildElements = (trackId: string) => {
  const v = []
  let i = 1
  let month = buildTrackStartGap()

  while (month < NUM_OF_MONTHS) {
    let monthSpan =
      Math.floor(Math.random() * (MAX_MONTH_SPAN - (MIN_MONTH_SPAN - 1))) +
      MIN_MONTH_SPAN

    if (month + monthSpan > NUM_OF_MONTHS) {
      monthSpan = NUM_OF_MONTHS - month
    }

    const start = addMonthsToYearAsDate(START_YEAR, month)
    const end = addMonthsToYearAsDate(START_YEAR, month + monthSpan)
    v.push(
      buildElement({
        trackId,
        start,
        end,
        i,
      })
    )
    const gap = buildElementGap()
    month += monthSpan + gap
    i += 1
  }

  return v
}

export const buildSubtrack = (trackId: string, subtrackId: string) => ({
  id: `track-${trackId}-${subtrackId}`,
  title: `Subtrack ${subtrackId}`,
  elements: buildElements(subtrackId),
})

export const buildTrack = (trackId: string) => {
  return {
    id: `track-${trackId}`,
    title: `Track ${trackId}`,
    elements: buildElements(trackId),
    tracks: [],
    // hasButton: true,
    // link: 'www.google.com',
    isOpen: false,
  }
}
