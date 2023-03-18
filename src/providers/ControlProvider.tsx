import React, { createContext, useState, useContext } from "react"

export interface ContextState<T> {
  state: T
  setState: React.Dispatch<React.SetStateAction<ControlState>>
}

export interface ControlState {
  mode: "view" | "edit"
  viewSpeed?: number
  viewRunning?: boolean
}

const initialState: ControlState = {
  mode: "view",
  viewSpeed: 1.0,
  viewRunning: false,
}

const Context: any = createContext<ContextState<ControlState> | undefined>(
  undefined
)

export const ControlProvider = (props: any) => {
  const [state, setState] = useState<ControlState>(initialState)

  // const setContext = (state: ControlState) => {
  //   setState((prevState: ControlState) => ({ ...prevState, ...state }))
  // }

  return (
    <Context.Provider value={{ state: { ...state }, setState }}>
      <>{props.children}</>
    </Context.Provider>
  )
}

export const useControlState = (): [
  ControlState,
  React.Dispatch<React.SetStateAction<ControlState>>
] => {
  const ctx: ContextState<ControlState> | undefined = useContext(Context)
  if (ctx === undefined) {
    throw new Error("useControlState should be used within ControlProvider")
  }
  const { state, setState } = ctx
  return [
    state as ControlState,
    setState as React.Dispatch<React.SetStateAction<ControlState>>,
  ]
}
