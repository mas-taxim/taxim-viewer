import React from "react"
import Dot from "../../components/Dot"
import { CustomOverlayMap, useMap } from "react-kakao-maps-sdk"

const Editor = (): React.ReactElement => {
  return (
    <>
      <CustomOverlayMap
        position={{
          lat: 37.52897,
          lng: 126.917101,
        }}
        ref={(ref: any) => {
          if (ref == null) return
          const parentNode = ref.cc.parentElement
          parentNode.className = "vehicle-marker"
        }}
      >
        <Dot color={"dodgerblue"} size={3}></Dot>
      </CustomOverlayMap>
    </>
  )
}

export default Editor
