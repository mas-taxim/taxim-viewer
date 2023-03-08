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

const Circle = styled.div`
  position: absolute;
  width: ${({ size }) => `${size}em`};
  height: ${({ size }) => `${size}em`};
  left: ${({ size }) => `-${size / 2}em`};
  top: ${({ size }) => `-${size / 2}em`};
  background: dodgerblue;
  border-radius: 8rem;

  ${(props) =>
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
  size?: number,
}

const Dot = ({ size = 2 }: DotProps) => {
  return (
    <Container>
      <Circle size={size} animate={true} />
      <Circle size={size} />
    </Container>
  )
}

export default Dot
