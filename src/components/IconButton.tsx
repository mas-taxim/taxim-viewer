import React, { useCallback } from "react"

import MuiIconButton from "@mui/joy/IconButton"
import MuiTooltip from "@mui/joy/Tooltip"
import CircularProgress from "@mui/joy/CircularProgress"

type IconButtonProps = React.PropsWithChildren & {
  tooltip?: React.ReactNode
  tooltipColor:
    | "primary"
    | "neutral"
    | "danger"
    | "info"
    | "success"
    | "warning"
  tooltipPlacement?:
    | "bottom"
    | "left"
    | "right"
    | "top"
    | "bottom-end"
    | "bottom-start"
    | "left-end"
    | "left-start"
    | "right-end"
    | "right-start"
    | "top-end"
    | "top-start"
  tooltipSize?: "sm" | "md" | "lg"
  active: boolean
  disabled?: boolean
  loading?: boolean
  variant?: "plain" | "outlined" | "soft" | "solid"
  size: string
  onClick: () => void
}

const IconButton = ({
  tooltip = undefined,
  tooltipColor = "primary",
  tooltipPlacement = "bottom",
  tooltipSize = "sm",
  active,
  disabled = false,
  loading = false,
  variant = "plain",
  size,
  onClick,
  children,
}: IconButtonProps) => {
  return (
    <MuiTooltip
      arrow
      title={tooltip}
      color={tooltipColor}
      placement={tooltipPlacement}
      size={tooltipSize}
      variant={variant}
    >
      <MuiIconButton
        variant={active ? "solid" : "soft"}
        sx={{
          "--IconButton-size": size,
        }}
        disabled={disabled}
        onClick={onClick}
      >
        {loading ? (
          <CircularProgress
            color="primary"
            size="sm"
            value={33}
            variant="plain"
          />
        ) : (
          children
        )}
      </MuiIconButton>
    </MuiTooltip>
  )
}

export default IconButton
