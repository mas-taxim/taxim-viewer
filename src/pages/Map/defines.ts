export const MarkerType = {
  NONE: -1,
  VEHICLE: 0,
  PERSON_PICK: 1,
  PERSON_DROP: 2,
}

export type MarkerPosition = {
  key: string | null
  color?: string
  size: number
  lat: number
  lng: number
  type: number
}

export interface ColorName {
  [key: string]: string
}

export type VehicleState = {
  name: string
  lat: number
  lng: number
  allocated_id: number | null
}

export type TaskType = {
  id: number
  drop_lat: number
  drop_lng: number
  pick_lat: number
  pick_lng: number
  status: number
  time: number
}
