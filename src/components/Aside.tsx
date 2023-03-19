import React, { useState, useCallback, PropsWithChildren } from "react"

import styled, { css, keyframes } from "styled-components"

import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"

const ContainerWrapper = styled.div<{ fold: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 280px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-items: center;
  transition: transform 400ms cubic-bezier(0.65, 0.05, 0.36, 1);
  z-index: 99999;

  ${({ fold }: any) =>
    fold &&
    css`
      transform: translateX(-100%);
    `}
`

const ContainerStyled = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: 0;
  border-radius: 0;
  outline: 0;
  margin: 0;
  padding: 1em 2em;
  box-sizing: border-box;
  box-shadow: 0 0 1em rgba(128, 128, 128, 0.5);
  overflow-y: auto;
`

const FoldButtonContainerStyled = styled.div`
  position: absolute;
  display: flex;
  width: 1.25em;
  height: 100%;
  right: -1.25em;
  justify-content: center;
  align-items: center;
`

const FoldButtonStyled = styled.div`
  width: 100%;
  height: 3em;
  display: flex;
  padding: 0 2px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background-color: #ffffff;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  clip-path: inset(-1em -1em -1em 0px);
  box-shadow: 0 0 1em rgba(128, 128, 128, 0.5);
  cursor: pointer;
`

type ContainerProps = {
  _ref: React.ForwardedRef<any>
  children?: React.ReactNode
}

const Container = ({
  _ref: ref,
  children,
}: ContainerProps): React.ReactElement => {
  const [fold, setFold] = useState<boolean>(true)
  const ArrowIcon = useCallback(() => {
    const props = {
      sx: {
        width: "100%",
        fontSize: "1rem",
      },
    }
    return fold ? (
      <KeyboardDoubleArrowRightIcon {...props} />
    ) : (
      <KeyboardDoubleArrowLeftIcon {...props} />
    )
  }, [fold])
  return (
    <ContainerWrapper fold={fold}>
      <ContainerStyled ref={ref}>
        <>{children}</>
      </ContainerStyled>
      <FoldButtonContainerStyled>
        <FoldButtonStyled
          onClick={(evt) => {
            setFold((prev) => !prev)
          }}
        >
          <ArrowIcon />
        </FoldButtonStyled>
      </FoldButtonContainerStyled>
    </ContainerWrapper>
  )
}

const Aside = React.forwardRef((props: PropsWithChildren, ref) => (
  <Container _ref={ref}>
    <>{props.children}</>
  </Container>
))

export default Aside
