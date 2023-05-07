/* global kakao */

import React, { useEffect, useState, useCallback, useRef } from "react"

import { Divider, Stack, Typography } from "@mui/joy"
import MuiTooltip from "@mui/joy/Tooltip"
import styled from "styled-components"

import { humanizeDate } from "../../../helpers/stringFormat"
import { ColorName, VehicleState, TaskType, MarkerType } from "../defines"
import { focusTo } from "../utils"
import { Icon } from "../components"

type LogItemProps = {
  vehicle: VehicleState
  tasks: TaskType[]
  colors: ColorName
}

const VehicleLogInfoStyled = styled.div`
  width: calc(100% - 12px);
  position: relative;
  box-sizing: border-box;
  padding: 0 6px;
  display: flex;
  align-items: center;
`

const RoadLineStyled = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;
  background-color: #efefef;
  border-radius: 1em;
  z-index: 0;
`

const VehicleIconTooltipStyled = styled.div`
  position: absolute;
  bottom: calc(-32px / 2 - -8px);
  font-size: 12px;
  left: calc(32px / 2);
  width: fit-content;
  white-space: nowrap;
  word-break: keep-all;
  background: ${({ color }: any) => color};
  color: white;
  border-radius: 3px;
  padding: 2px 6px;
  box-sizing: border-box;
  min-width: 32px;
  transform: translateX(-50%);
  text-align: center;
  box-shadow: 0 0 3px rgba(128, 128, 128, 0.2);
`

const LogInfoStyled = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: 0.5rem 0;
`

const get_slope_weight = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number
) => {
  const lx = Math.abs(x2 - x1)
  const ly = Math.abs(y2 - y1)
  const dx = cx - x1
  const dy = cy - y1
  const r = Math.sqrt(dx * dx + dy * dy) / Math.sqrt(lx * lx + ly * ly)
  return Math.max(0.0, Math.min(r * 100.0, 100.0))
}

const LogIcon = ({
  color,
  style,
  children,
  tooltip = null,
  onClick,
}: any): React.ReactElement => {
  const [isHover, setHover] = useState<boolean>(false)
  return (
    <div
      style={{
        backgroundColor: color || "black",
        display: "flex",
        justifyItems: "center",
        alignItems: "center",
        width: "32px",
        height: "32px",
        borderRadius: "6rem",
        ...style,
      }}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick || null}
    >
      <>{children}</>
      <>{tooltip != null && isHover && tooltip}</>
    </div>
  )
}

const LogItemVehicleWithTask = ({ vehicle, tasks, colors }: LogItemProps) => {
  const { name: vehicle_id, lat, lng, allocated_id } = vehicle

  const vehicleTooltip = (
    <VehicleIconTooltipStyled color={colors[vehicle_id]}>
      {vehicle_id}
    </VehicleIconTooltipStyled>
  )

  if (tasks.length < 1) {
    const IconEmptyStyle = {
      backgroundColor: "transparent",
      borderWidth: "1px",
      borderColor: "gray",
      borderStyle: "dashed",
    }
    return (
      <>
        <LogInfoStyled className="pairs" key={`log-info-${vehicle_id}`}>
          <LogIcon
            color={"transparent"}
            style={{
              justifySelf: "flex-start",
              ...IconEmptyStyle,
            }}
          />
          <VehicleLogInfoStyled>
            <RoadLineStyled
              style={{
                borderTop: `dashed 2px ${colors[vehicle_id]}`,
                height: "auto",
                background: "transparent",
                borderRadius: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "calc(100% - 32px)",
                top: 0,
              }}
            >
              <LogIcon
                key={`logicon-${vehicle_id}`}
                color={colors[vehicle_id]}
                style={{
                  position: "absolute",
                  left: "50%",
                  transition: "all 300ms ease",
                  zIndex: 1,
                  backgroundColor: "white",
                  borderWidth: "1px",
                  borderColor: colors[vehicle_id],
                  borderStyle: "dashed",
                }}
                tooltip={vehicleTooltip}
              >
                <Icon
                  type={MarkerType.VEHICLE}
                  style={{
                    margin: "0 auto",
                    fill: colors[vehicle_id],
                  }}
                />
              </LogIcon>
            </div>
          </VehicleLogInfoStyled>
          <LogIcon
            color={"transparent"}
            style={{
              justifySelf: "flex-end",
              ...IconEmptyStyle,
            }}
          />
        </LogInfoStyled>
      </>
    )
  }

  const task = tasks[0]
  const {
    id: task_id,
    status,
    pick_lat,
    pick_lng,
    drop_lat,
    drop_lng,
  }: TaskType = task as TaskType

  const isPicked = status > 5
  const isDroped = status > 6

  const IconReadyStyle = {
    backgroundColor: "transparent",
    borderWidth: "1px",
    borderColor: colors[vehicle_id],
    borderStyle: "dashed",
  }

  const IconNotReadyStyle = {
    borderWidth: "1px",
    borderColor: "transparent",
    borderStyle: "solid",
  }

  const IconReadyInnerStyle = {
    fill: colors[vehicle_id],
  }

  return (
    <LogInfoStyled className="pairs" key={`log-info-${vehicle_id}`}>
      <LogIcon
        color={status <= 5 ? "transparent" : colors[vehicle_id]}
        style={{
          justifySelf: "flex-start",
          cursor: "pointer",
          ...(isPicked ? IconNotReadyStyle : IconReadyStyle),
        }}
        onClick={() => focusTo(pick_lat, pick_lng)}
      >
        <Icon
          type={MarkerType.PERSON_PICK}
          style={{
            margin: "0 auto",
            ...(isPicked ? {} : IconReadyInnerStyle),
          }}
        />
      </LogIcon>
      <VehicleLogInfoStyled>
        <RoadLineStyled
          style={isPicked ? { backgroundColor: colors[vehicle_id] } : {}}
        />
        <div
          style={{
            position: "absolute",
            width: "calc(100% - 32px)",
            top: 0,
          }}
        >
          <LogIcon
            key={`logicon-${vehicle_id}`}
            color={colors[vehicle_id]}
            style={{
              position: "absolute",
              left: `${get_slope_weight(
                pick_lat,
                pick_lng,
                drop_lat,
                drop_lng,
                lat,
                lng
              )}%`,
              transition: "all 300ms ease",
              cursor: "pointer",
              zIndex: 1,
            }}
            tooltip={vehicleTooltip}
            onClick={() => focusTo(lat, lng)}
          >
            <Icon
              type={MarkerType.VEHICLE}
              style={{
                margin: "0 auto",
              }}
            />
          </LogIcon>
        </div>
      </VehicleLogInfoStyled>
      <LogIcon
        color={colors[vehicle_id]}
        style={{
          justifySelf: "flex-end",
          cursor: "pointer",
          ...(isDroped ? IconNotReadyStyle : IconReadyStyle),
        }}
        onClick={() => focusTo(drop_lat, drop_lng)}
      >
        <Icon
          type={MarkerType.PERSON_DROP}
          style={{
            margin: "0 auto",
            ...(isDroped ? {} : IconReadyInnerStyle),
          }}
        />
      </LogIcon>
    </LogInfoStyled>
  )
}

const LogInfo = ({ time, vehicles, tasks, colors }: any) => {
  return (
    <>
      {Array.from(vehicles.values())
        .map((value) => value as VehicleState)
        .map((thisVehicle: VehicleState) => {
          const { name, lat, lng, allocated_id } = thisVehicle
          const thisTasks = Array.from(tasks || []).filter(
            ({ id }: any) => id === allocated_id
          )
          return (
            <LogItemVehicleWithTask
              vehicle={thisVehicle}
              tasks={thisTasks as TaskType[]}
              colors={colors}
            />
          )
        })}
    </>
  )
}

type ViewerProp = {
  logs: Array<any>
  vehiclesState: Map<string, VehicleState>
  colors: ColorName
}

const PanelView = ({
  logs,
  vehiclesState,
  colors,
}: ViewerProp): React.ReactElement => {
  if (!logs || logs.length < 1) {
    return (
      <center
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
        }}
      >
        <Typography
          color="neutral"
          fontSize={2}
          sx={{
            translate: "0% -50%",
            textAlign: "center",
          }}
        >
          재생할 정보가 없습니다.
        </Typography>
      </center>
    )
  }
  const latestLog = logs[logs.length - 1]
  const { time, tasks } = latestLog
  return (
    <Stack spacing={1}>
      <div key={`log-${time}`}>
        <Divider
          sx={{
            marginTop: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <Typography color="neutral" fontSize={2}>
            {humanizeDate(new Date(time))}
          </Typography>
        </Divider>
        <LogInfo
          time={time}
          vehicles={vehiclesState}
          tasks={tasks}
          colors={colors}
        />
      </div>
    </Stack>
  )
}

export default PanelView
