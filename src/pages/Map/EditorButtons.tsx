import React, { useCallback, useRef } from "react"

import GrainIcon from "@mui/icons-material/Grain"
import PolylineIcon from "@mui/icons-material/Polyline"
import OpenWithIcon from "@mui/icons-material/OpenWith"
import UploadIcon from "@mui/icons-material/Upload"
import DownloadIcon from "@mui/icons-material/Download"

import IconButton from "../../components/IconButton"
import HorizontalContainer, {
  Divider,
} from "../../components/HorizontalContainer"

type MenuButtonProps = {
  title: string
  active?: boolean
  icon: React.ReactElement
  onClick: () => void
}

const MenuButton = ({
  title,
  active = false,
  icon,
  onClick,
}: MenuButtonProps) => {
  return (
    <IconButton
      tooltip={title}
      tooltipColor="primary"
      tooltipPlacement="top"
      active={active}
      variant="outlined"
      size={"32px"}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  )
}

type EditorButtonsProps = {
  editMode: string
  onModeChanged: (mode: string) => void
  onClickUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClickDownload: () => void
}

const EditorButtons = ({
  editMode,
  onModeChanged,
  onClickUpload,
  onClickDownload,
}: EditorButtonsProps): React.ReactElement => {
  const onSelectMode = (mode: string) => {
    onModeChanged(mode)
  }

  const ModeButtons = useCallback((): React.ReactElement => {
    return (
      <>
        <MenuButton
          title="점 추가/삭제"
          active={editMode === "add"}
          icon={<GrainIcon />}
          onClick={() => onSelectMode("add")}
        />
        <MenuButton
          title="점 연결"
          active={editMode === "link"}
          icon={<PolylineIcon />}
          onClick={() => onSelectMode("link")}
        />
        <MenuButton
          title="점 이동"
          active={editMode === "move"}
          icon={<OpenWithIcon />}
          onClick={() => onSelectMode("move")}
        />
      </>
    )
  }, [editMode])

  const UploadButton = useCallback((): React.ReactElement => {
    const ref = useRef<HTMLInputElement>(null)
    return (
      <>
        <label
          htmlFor="upload-log"
          style={{
            width: "100%",
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

  const DownloadButton = useCallback(
    (): React.ReactElement => (
      <MenuButton
        title="다운로드"
        icon={<DownloadIcon />}
        onClick={onClickDownload}
      />
    ),
    [onClickDownload]
  )

  return (
    <>
      <HorizontalContainer position="bottom">
        <ModeButtons />
        <Divider />
        <UploadButton />
        <DownloadButton />
      </HorizontalContainer>
    </>
  )
}

export default EditorButtons
