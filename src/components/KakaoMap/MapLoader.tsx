import React, { useEffect } from "react"

import KakaoMapSDK, {
  Map,
  useInjectKakaoMapApi,
  useMap,
} from "react-kakao-maps-sdk"
import styled from "styled-components"

type MapProps = KakaoMapSDK.MapProps & {
  style?: React.CSSProperties
}

const Dimmer = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
`

export default function MapLoader(props: MapProps): React.ReactElement {
  const { loading, error } = useInjectKakaoMapApi({
    appkey: process.env.REACT_APP_KAKAO_MAP_API_KEY as string,
    libraries: ["services", "clusterer"],
    retries: 3,
  })
  return (
    <>
      {loading || error ? (
        <Dimmer />
      ) : (
        <Map {...(props as KakaoMapSDK.MapProps)} />
      )}
    </>
  )
}
