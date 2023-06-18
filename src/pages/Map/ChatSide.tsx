import React, { PropsWithChildren, useCallback } from "react"
import styled, { css } from "styled-components"
import { Stack } from "@mui/joy"
import Avatar from "@mui/joy/Avatar"
import IconButton from "@mui/joy/IconButton"
import SendRoundedIcon from "@mui/icons-material/SendRounded"

const WELCOME_MESSAGES = [
  "안녕하세요, 무엇을 도와드릴까요?",
  "무엇을 도와드릴까요?",
  "어떤 질문이 있으신가요?",
  "어떤 주제에 대해 이야기해 보고 싶으신가요?",
  "도와드릴 일이 있으시면 말씀해 주세요.",
]

export const getRandomWelcomeMessage = (): string =>
  WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]

const ChatContainerStyled = styled.div`
  padding: 1em 2em;
  background-color: white;
  height: calc(100% - 60px);
  box-sizing: border-box;
`

const ChatTextFieldContainerStyled = styled.div`
  display: grid;
  grid-gap: 0;
  height: 50px;
  margin-top: 10px;
  border-top: 1px solid #efefef;
  box-shadow: 0 0 5px rgba(128, 128, 128, 0.1);
  grid-template-columns: 1fr 50px;
`

const ChatTextFieldStyled = styled.input`
  height: 100%;
  position: relative;
  width: 100%;
  border: none;
  outline: none;
  padding: 0;
  box-sizing: border-box;
  vertical-align: top;
  margin: 0;
  width: 100%;
  padding: 1em;
  color: #1f1f1f;
`

const ChatMessageStyled = styled.div<{
  direction: "left" | "right"
  color: string
  backgroundColor?: string
}>`
  position: relative;
  color: ${({ color }) => color || "#3f3f3f"};
  background-color: ${({ backgroundColor }) => backgroundColor || "#eaecef"};
  font-size: 0.85em;
  line-height: 1.375em;
  width: fit-content;
  min-width: 120px;
  max-width: 90%;
  padding-top: 1em;
  padding-bottom: 1em;
  padding-left: ${({ direction }) => (direction === "left" ? "1.5em" : "1em")}};
  padding-right: 1em;
  text-align: ${({ direction }) => (direction === "left" ? "left" : "right")}};
  box-sizing: border-box;
  border-radius: 14px;
  border-color: #ccc;
  border-style: none;
  outline: none;

  .user-avatar {
    position: absolute;
    top: -1em;
    ${({ direction }: any) =>
      direction === "left"
        ? css`
            left: -0.5em;
          `
        : css`
            right: -0.5em;
          `}
  }
`

type ChatMessageProp = {
  children: React.ReactElement[] | React.ReactElement | string
  direction: "left" | "right"
}

const ChatMessage = ({ children, direction }: ChatMessageProp) => {
  const stackStyle =
    direction === "left"
      ? {
          alignItems: "flex-start",
        }
      : {
          alignItems: "flex-end",
        }
  const isBot = direction === "left"
  return (
    <Stack {...stackStyle}>
      <ChatMessageStyled
        direction={direction}
        color={isBot ? "#2f2f2f" : "#efefef"}
        backgroundColor={isBot ? "#eaecef" : "#3883f3"}
      >
        <>{children}</>
        {isBot && (
          <div className="user-avatar">
            <Avatar
              alt="Bot"
              src="/bot_image.png"
              sx={{
                outline: "3px solid #fff",
                width: "1.5em",
                height: "1.5em",
              }}
            />
          </div>
        )}
      </ChatMessageStyled>
    </Stack>
  )
}

export type ChatMessageType = {
  text: string
  from: "bot" | "user"
  action: "focus" | "nothing" | null
  data: any
}

type ChatSideProps = {
  messages: ChatMessageType[]
}

const ChatSide = ({ messages }: ChatSideProps): React.ReactElement => {
  return (
    <ChatContainerStyled>
      <Stack
        direction="column"
        justifyContent="flex-end"
        alignItems="stretch"
        spacing={2}
        sx={{ height: "100%" }}
      >
        {messages.map(({ text, from, action, data }: ChatMessageType) => (
          <ChatMessage direction={from === "bot" ? "left" : "right"}>
            {text}
          </ChatMessage>
        ))}
      </Stack>
    </ChatContainerStyled>
  )
}

type ChatInputContainerProps = {
  controlledText: string | null
  onTextChange: (text: string) => void
  onTextSend: (text: string) => void
}

export const ChatInputContainer = ({
  controlledText = "",
  onTextChange,
  onTextSend,
}: ChatInputContainerProps): React.ReactElement => {
  const send = useCallback(() => {
    onTextSend(controlledText as string)
  }, [controlledText, onTextSend])
  return (
    <>
      <ChatTextFieldContainerStyled>
        <ChatTextFieldStyled
          type="text"
          placeholder="여기에 입력하세요..."
          value={controlledText as string}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.code === "Enter") send()
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onTextChange(event.target.value as string)
          }}
        />
        <IconButton
          size="sm"
          variant="plain"
          sx={{
            borderRadius: 0,
          }}
          onClick={() => send()}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </ChatTextFieldContainerStyled>
    </>
  )
}

export default ChatSide
