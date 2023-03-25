import React from "react"
import styled from "styled-components"

type CircleStyleProps = {
  size: number
  color?: string
  selected: boolean
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
  border-color: ${({ selected, color = "#d3232f" }: CircleStyleProps) =>
    selected ? "black" : color};
  border-radius: 8rem;
  align-items: center;
  justify-content: center;
  scale: ${({ size }: CircleStyleProps) => size};
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: ${({ selected, color = "#a10e25" }: CircleStyleProps) =>
      selected ? "black" : color};
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

type PointProps = {
  id: string
  size?: number
  color?: string
  selected?: boolean
  children?: React.ReactNode | React.ReactNode[]
  onMouseEnter?: React.MouseEventHandler<any>
  onMouseLeave?: React.MouseEventHandler<any>
  onMouseDown?: React.MouseEventHandler<any>
  onMouseUp?: React.MouseEventHandler<any>
  onClick?: React.MouseEventHandler<any>
}

const Point = ({
  id,
  size = 2,
  selected = false,
  color,
  children,
  onMouseEnter,
  onMouseDown,
  onMouseLeave,
  onMouseUp,
  onClick,
}: PointProps) => {
  return (
    <Container data-id={id}>
      <Circle
        size={size}
        color={color}
        selected={selected}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onClick={onClick}
      >
        <div className="icon">{children}</div>
      </Circle>
    </Container>
  )
}

export default Point
