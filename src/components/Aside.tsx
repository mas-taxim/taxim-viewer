import React from "react"

import styled, { css, keyframes } from "styled-components"

const ContainerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 400px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-items: center;
  transition: transform 400ms cubic-bezier(0.65, 0.05, 0.36, 1);
  z-index: 99999;

  &.fold {
    transform: translateX(-100%);
  }
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
`

const Container = (props: React.PropsWithChildren): React.ReactElement => {
  return (
    <ContainerWrapper>
      <ContainerStyled>
        <>{props.children}</>
      </ContainerStyled>
    </ContainerWrapper>
  )
}

const Aside = (props: React.PropsWithChildren): React.ReactElement => {
  return (
    <Container>
      <>{props.children}</>
    </Container>
  )
}

export default Aside
