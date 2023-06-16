import React, { useState, useCallback, useRef, useEffect } from "react"

import { Slider, Menu, MenuItem } from "@mui/joy"
import UploadIcon from "@mui/icons-material/Upload"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp"
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"

import IconButton from "../../../components/IconButton"
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo"
import HorizontalContainer, {
  Divider,
} from "../../../components/HorizontalContainer"
import styled from "styled-components"

type MenuButtonProps = {
  title?: string
  active?: boolean
  disabled?: boolean
  loading?: boolean
  icon: React.ReactElement
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const MenuButton = ({
  title,
  active = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
}: MenuButtonProps) => {
  return (
    <IconButton
      tooltip={title}
      tooltipColor="primary"
      tooltipPlacement="top"
      active={active}
      disabled={disabled}
      loading={loading}
      variant="outlined"
      size={"32px"}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  )
}

type SpeedControlProps = {
  speed: number
  onSelectSpeed: (speed: number) => void
}

const PlaySpeedButton = ({
  speed,
  onSelectSpeed,
}: SpeedControlProps): React.ReactElement => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const isOpen = Boolean(anchorEl)
  const handleClick = (event: React.SyntheticEvent<any>) => {
    setAnchorEl(event.currentTarget)
  }
  const close = () => {
    setAnchorEl(null)
  }
  const select = (item: number) => {
    onSelectSpeed(item)
    close()
  }

  const Item = useCallback(
    (item: number): React.ReactElement => (
      <MenuItem
        {...(speed === item && { selected: true, variant: "soft" })}
        onClick={() => select(item)}
      >
        x{item.toFixed(1)}
      </MenuItem>
    ),
    [speed]
  )

  return (
    <div>
      <MenuButton
        title={isOpen ? undefined : "재생 속도"}
        onClick={handleClick}
        icon={<SlowMotionVideoIcon />}
      />
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={close}
        color="primary"
        size="sm"
        variant="plain"
      >
        {Item(1.0)}
        {Item(2.0)}
        {Item(5.0)}
        {Item(10.0)}
      </Menu>
    </div>
  )
}

const SliderWrapperStyled = styled.div`
  width: calc(100vw - 600px);
  width: calc(100svw - 600px);
  max-width: 480px;
  padding-left: 0.5rem;
  padding-right: 1rem;
  box-sizing: border-box;
`

type ViewerButtonsProps = {
  running: boolean
  runable: boolean
  progressMax: number
  progressCurrent: number
  onProgressUpdated: (progress: number) => void
  onClickPlay: () => void
  onClickUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClickExpand: (expand: boolean) => void
} & SpeedControlProps

const ViewerButtons = ({
  running,
  runable,
  progressMax,
  progressCurrent,
  speed,
  onSelectSpeed,
  onProgressUpdated,
  onClickPlay,
  onClickUpload,
  onClickExpand,
}: ViewerButtonsProps): React.ReactElement => {
  const [isExpanded, setExpanded] = useState<boolean>(true)

  const PlayControlButton = useCallback((): React.ReactElement => {
    return running ? (
      <MenuButton title="일시정지" onClick={onClickPlay} icon={<PauseIcon />} />
    ) : (
      <MenuButton
        title="재생"
        disabled={!runable}
        onClick={onClickPlay}
        icon={<PlayArrowIcon />}
      />
    )
  }, [running, runable])

  const UploadButton = useCallback((): React.ReactElement => {
    const ref = useRef<HTMLInputElement>(null)
    return (
      <>
        <label
          htmlFor="upload-log"
          style={{
            width: "32px",
          }}
        >
          <input
            ref={ref}
            style={{ display: "none" }}
            id="upload-log"
            name="upload-log"
            type="file"
            accept=".json,application/json"
            onChange={onClickUpload}
          />
          <MenuButton
            title="업로드"
            icon={<UploadIcon />}
            onClick={() => {
              if (ref.current) {
                ref.current.click()
              }
            }}
          />
        </label>
      </>
    )
  }, [onClickUpload])

  const ExpandButton = useCallback((): React.ReactElement => {
    return (
      <>
        <MenuButton
          title={isExpanded ? "닫기" : "자세히 보기"}
          icon={
            isExpanded ? (
              <KeyboardDoubleArrowDownIcon />
            ) : (
              <KeyboardDoubleArrowUpIcon />
            )
          }
          onClick={() => {
            setExpanded((prev) => !prev)
          }}
        />
      </>
    )
  }, [setExpanded, isExpanded])

  useEffect(() => {
    onClickExpand(isExpanded)
  }, [isExpanded, onClickExpand])

  return (
    <>
      <HorizontalContainer position="bottom">
        <UploadButton />
        <PlayControlButton />
        <PlaySpeedButton speed={speed} onSelectSpeed={onSelectSpeed} />
        <Divider />
        <SliderWrapperStyled>
          <Slider
            color="primary"
            aria-label="Timestamp"
            defaultValue={0}
            value={progressCurrent}
            min={0}
            max={progressMax}
            step={1}
            disabled={!runable || running}
            size="md"
            valueLabelDisplay="off"
            variant="solid"
            onChange={(
              event: React.SyntheticEvent | Event,
              value: number | number[]
            ) => {
              console.log("new value", value)
              if (typeof value === "number") {
                onProgressUpdated(value)
              } else {
                onProgressUpdated(value[0])
              }
            }}
            style={{
              width: "calc(100% - 0.5rem)",
              marginLeft: "0.5rem",
            }}
          />
        </SliderWrapperStyled>
        <Divider />
        <ExpandButton />
      </HorizontalContainer>
    </>
  )
}

export default ViewerButtons
