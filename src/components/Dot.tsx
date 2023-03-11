import React from "react"
import styled, { css, keyframes } from "styled-components"

const paddleAnimation = keyframes`
  from {
    transform: scale(1.0);
    opacity: 1.0;
  }
  to {
    transform: scale(2.0);
    opacity: 0.0;
  }
`

type CircleStyleProps = {
  size: number
  color: string
  animate?: boolean
  children?: React.ReactNode | React.ReactNode[]
}

const Circle = styled.div`
  position: absolute;
  display: flex;
  width: 1em;
  height: 1em;
  background: ${({ color }: CircleStyleProps) => color};
  border-radius: 8rem;
  align-items: center;
  justify-content: center;
  scale: ${({ size }: CircleStyleProps) => size};

  ${(props: CircleStyleProps) =>
    props.animate &&
    css`
      animation: ${paddleAnimation} 1s ease-in-out infinite;
    `};

  > .icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

type DotProps = {
  color?: string
  size?: number
  children?: React.ReactNode | React.ReactNode[]
}

const Dot = ({ color = "dodgerblue", size = 2, children }: DotProps) => {
  return (
    <Container>
      <Circle color={color} size={size} animate={true} />
      <Circle color={color} size={size}>
        <div className="icon">{children}</div>
      </Circle>
    </Container>
  )
}

export default Dot
