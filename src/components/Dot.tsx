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
}

const Circle = styled.div`
  position: absolute;
  width: ${({ size }: CircleStyleProps) => `${size}em`};
  height: ${({ size }: CircleStyleProps) => `${size}em`};
  left: ${({ size }: CircleStyleProps) => `-${size / 2}em`};
  top: ${({ size }: CircleStyleProps) => `-${size / 2}em`};
  background: ${({ color }: CircleStyleProps) => color};
  border-radius: 8rem;

  ${(props: CircleStyleProps) =>
    props.animate &&
    css`
      animation: ${paddleAnimation} 1s ease-in-out infinite;
    `}
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
}

const Dot = ({ color = "dodgerblue", size = 2 }: DotProps) => {
  return (
    <Container>
      <Circle color={color} size={size} animate={true} />
      <Circle color={color} size={size} />
    </Container>
  )
}

export default Dot
