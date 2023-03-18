import React, { useState, useCallback, useRef } from "react"

import { Slider } from "@mui/joy"
import UploadIcon from "@mui/icons-material/Upload"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"

import IconButton from "../../components/IconButton"
import HorizontalContainer, {
  Divider,
} from "../../components/HorizontalContainer"
import styled from "styled-components"

type MenuButtonProps = {
  title: string
  active?: boolean
  disabled?: boolean
  loading?: boolean
  icon: React.ReactElement
  onClick: () => void
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
  onClickPlay: () => void
  onClickUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ViewerButtons = ({
  running,
  runable,
  onClickPlay,
  onClickUpload,
}: ViewerButtonsProps): React.ReactElement => {
  const PlayControlButton = useCallback((): React.ReactElement => {
    return (
      <MenuButton
        title="재생"
        loading={running}
        disabled={running || !runable}
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

  return (
    <>
      <HorizontalContainer position="bottom">
        <UploadButton />
        <PlayControlButton />
        <Divider />
        <SliderWrapperStyled>
          <Slider
            color="primary"
            aria-label="Timestamp"
            defaultValue={0}
            min={0}
            max={800}
            step={1}
            disabled={!running}
            size="md"
            valueLabelDisplay="off"
            variant="solid"
            onChangeCommitted={(
              event: React.SyntheticEvent | Event,
              value: number | number[]
            ) => {
              console.log("new value", value)
            }}
            style={{
              width: "calc(100% - 0.5rem)",
              marginLeft: "0.5rem",
            }}
          />
        </SliderWrapperStyled>
      </HorizontalContainer>
    </>
  )
}

export default ViewerButtons
