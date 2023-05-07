import React, { CSSProperties } from "react"

import LocalTaxiIcon from "@mui/icons-material/LocalTaxi"
import HailIcon from "@mui/icons-material/Hail"
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"

import { MarkerType } from "./defines"

type DisplayIconProps = {
  type: number
  style?: CSSProperties
}

export const Icon = ({ type, style = {} }: DisplayIconProps): any => {
  const iconStyle = {
    fill: "white",
    marginTop: "-1px",
    width: "75%",
    ...style,
  }
  if (type == MarkerType.NONE) {
    return <></>
  } else if (type == MarkerType.VEHICLE) {
    return <LocalTaxiIcon style={iconStyle} />
  } else if (type == MarkerType.PERSON_PICK) {
    return <HailIcon style={iconStyle} />
  } else if (type == MarkerType.PERSON_DROP) {
    return <KeyboardDoubleArrowDownIcon style={iconStyle} />
  }
}
