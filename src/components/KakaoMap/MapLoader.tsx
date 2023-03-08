import React, { useEffect, useState, useMemo } from "react"

import KakaoMapSDK, { Map, Loader } from "react-kakao-maps-sdk"

export default function MapLoader(
  props: KakaoMapSDK.MapProps | React.CSSProperties
) {
  const [container, setContainer] = useState<React.ReactElement>()

  useEffect(() => {
    const script: Loader = new Loader({
      appkey: process.env.REACT_APP_KAKAO_MAP_API_KEY as string,
      libraries: ["services", "clusterer"],
      retries: 3,
    })
    script.load().then(() => {
      setContainer(<Map {...(props as KakaoMapSDK.MapProps)} />)
    })
  }, [setContainer])

  return <>{container}</>
}
