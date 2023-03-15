import React from "react"
import styled from "styled-components"

type CircleStyleProps = {
  size: number
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
  border-color: ${({ selected }: CircleStyleProps) =>
    selected ? "black" : "var(--joy-palette-danger-500, #d3232f)"};
  border-radius: 8rem;
  align-items: center;
  justify-content: center;
  scale: ${({ size }: CircleStyleProps) => size};
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    border-color: ${({ selected }: CircleStyleProps) =>
      selected ? "black" : "var(--joy-palette-danger-600, #a10e25)"};
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
