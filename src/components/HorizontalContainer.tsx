import React from "react"
import MUIDivider from "@mui/joy/Divider"
import styled, { css } from "styled-components"

const ContainerStyled = styled.div<{ position: "top" | "bottom" }>`
  position: absolute;
  display: flex;
  left: calc(200px + 50%);
  translate: -50% 0%;
  margin: 0 auto;
  width: fit-content;
  height: 42px;
  place-items: center;
  padding: 6px;
  background: white;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 1em;
  box-sizing: border-box;

  ${({ position }: any) =>
    position == "top"
      ? css`
          top: 1rem;
        `
      : css`
          bottom: 1rem;
        `}
`

const ContentStyled = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  margin: 0px auto;
  place-items: center;
  box-sizing: border-box;
`

type ContainerProps = React.PropsWithChildren & {
  position: "top" | "bottom"
}

const HorizontalContainer = ({
  position,
  children,
}: ContainerProps): React.ReactElement => (
  <ContainerStyled position={position}>
    <ContentStyled>{children}</ContentStyled>
  </ContainerStyled>
)

export const Divider = (): React.ReactElement => (
  <MUIDivider orientation="vertical" />
)

export default HorizontalContainer
