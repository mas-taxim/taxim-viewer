import React from "react"
import styled, { css } from "styled-components"
import { Stack } from "@mui/joy"
import Avatar from "@mui/joy/Avatar"

const ChatContainerStyled = styled.div`
  height: calc(100% - 4em);
  padding: 2em;
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
  line-height: 0.9em;
  width: fit-content;
  min-width: 120px;
  max-width: 90%;
  padding-top: 1em;
  padding-bottom: 1em;
  padding-left: ${({ direction }) => (direction === "left" ? "2em" : "1em")}};
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

const ChatSide = (): React.ReactElement => {
  return (
    <ChatContainerStyled>
      <Stack
        direction="column"
        justifyContent="flex-end"
        alignItems="stretch"
        spacing={2}
        sx={{ height: "100%" }}
      >
        <ChatMessage direction="left">
          안녕하세요, 무엇을 도와드릴까요?
        </ChatMessage>
        <ChatMessage direction="right">오늘은 무슨 요일인가요?</ChatMessage>
        <ChatMessage direction="left">오늘은 금요일입니다.</ChatMessage>
        <ChatMessage direction="right">오늘은 뭐하고 계세요?</ChatMessage>
        <ChatMessage direction="left">
          지금은 사용자님과 대화하고 있습니다.
        </ChatMessage>
        <ChatMessage direction="right">한국어를 잘하시네요.</ChatMessage>
        <ChatMessage direction="left">
          네, 한국어를 열심히 공부하고 있습니다.
        </ChatMessage>
        <ChatMessage direction="right">한국에 가본 적 있나요?</ChatMessage>
      </Stack>
    </ChatContainerStyled>
  )
}

export default ChatSide
