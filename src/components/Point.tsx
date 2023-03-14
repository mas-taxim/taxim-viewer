import React from "react"
import styled from "styled-components"

type CircleStyleProps = {
  size: number
  children?: React.ReactNode | React.ReactNode[]
}

const Circle = styled.div`
  position: absolute;
  display: flex;
  width: 0.75em;
  height: 0.75em;
  background: white;
  border-width: 0.15rem;
  border-style: solid;
  border-color: var(--joy-palette-danger-500, #d3232f);
  border-radius: 8rem;
  align-items: center;
  justify-content: center;
  scale: ${({ size }: CircleStyleProps) => size};
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: var(--joy-palette-danger-600, #a10e25);
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

type PointProps = {
  size?: number
  children?: React.ReactNode | React.ReactNode[]
}

const Point = ({ size = 2, children }: PointProps) => {
  return (
    <Container>
      <Circle size={size}>
        <div className="icon">{children}</div>
      </Circle>
    </Container>
  )
}

export default Point
