/* global kakao */

import { useMap } from "react-kakao-maps-sdk"

export const focusTo = (lat: number, lng: number) => {
  const map: kakao.maps.Map = useMap()
  map.panTo(new kakao.maps.LatLng(lat, lng))
}
