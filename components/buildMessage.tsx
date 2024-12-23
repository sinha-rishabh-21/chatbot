import { Message } from "ai";

export default function buildMessageArray(messages: Message[], input: string) {
  let messageArray: string = "\nChatHistory:{ \n";
  messages.map((message) => {
    messageArray += `${message.role} : ${message.content}\n`;
  });
  messageArray += "}\n\n";
  messageArray += `Input : ${input}\n\n`;
  messageArray +=
    "Your current input is in the Input field above. " +
    "You can refer to the ChatHistory for context, which includes the conversation so far.";
  return messageArray;
}
