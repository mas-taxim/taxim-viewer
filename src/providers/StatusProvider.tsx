import React, { createContext, useState, useContext } from "react"

export interface ContextState<T> {
  state: T
  setState: React.Dispatch<React.SetStateAction<T>>
}

export interface StatusState {
  currentTime: number | null
  logs: Array<any>
}

const initialState: StatusState = {
  currentTime: null,
  logs: [],
}

const Context: any = createContext<ContextState<StatusState> | undefined>(
  undefined
)

export const StatusProvider = (props: any) => {
  const [state, setState] = useState<StatusState>(initialState)

  return (
    <Context.Provider value={{ state: { ...state }, setState }}>
      <>{props.children}</>
    </Context.Provider>
  )
}

export const useStatusState = (): [
  StatusState,
  React.Dispatch<React.SetStateAction<StatusState>>
] => {
  const ctx: ContextState<StatusState> | undefined = useContext(Context)
  if (ctx === undefined) {
    throw new Error("useStatusState should be used within StatusProvider")
  }
  const { state, setState } = ctx
  return [
    state as StatusState,
    setState as React.Dispatch<React.SetStateAction<StatusState>>,
  ]
}
