import React, { useCallback } from "react"

import MuiIconButton from "@mui/joy/IconButton"
import MuiTooltip from "@mui/joy/Tooltip"

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
  variant?: "plain" | "outlined" | "soft" | "solid"
  size: string
  onClick: () => void
}

// const IconButton = ({
//   tooltip = undefined,
//   tooltipColor = "primary",
//   tooltipPlacement = "bottom",
//   tooltipSize = "sm",
//   active,
//   variant = "plain",
//   size,
//   onClick,
//   children,
// }: IconButtonProps) => {
//   const Button = useCallback(
//     () => (
//       <MuiIconButton
//         variant={active ? "solid" : "soft"}
//         sx={{
//           "--IconButton-size": size,
//         }}
//         onClick={onClick}
//       >
//         {children}
//       </MuiIconButton>
//     ),
//     [active, onClick, children]
//   )
//   return (
//     <MuiTooltip
//       arrow
//       title={tooltip}
//       color={tooltipColor}
//       placement={tooltipPlacement}
//       size={tooltipSize}
//       variant={variant}
//     >
//       <Button />
//     </MuiTooltip>
//   )
// }

const IconButton = ({
  tooltip = undefined,
  tooltipColor = "primary",
  tooltipPlacement = "bottom",
  tooltipSize = "sm",
  active,
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
        onClick={onClick}
      >
        {children}
      </MuiIconButton>
    </MuiTooltip>
  )
}

export default IconButton
