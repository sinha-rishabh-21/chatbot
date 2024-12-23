import { Message } from "ai";
import generateId from "./generateId";
import buildMessageArray from "./buildMessage";

export default async function sendPostRequest(
  messages: Message[],
  input: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<boolean>>,
  abortController: AbortController
) {
  setIsLoading(true);
  try {
    const response = await fetch("http://localhost:3001/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: buildMessageArray(messages, input) }),
      signal: abortController.signal, // Attach the signal here
    });

    if (!response.ok) {
      setIsLoading(false);
      return setError(true);
    }

    const { message, output, detected_language } = await response.json();

    // Create the new message object
    const stream: Message = {
      id: generateId(),
      role: "assistant",
      content: output,
      data: { detected_language: detected_language },
    };

    setMessages((prevMessages) => [...prevMessages, stream]);
  } catch (error) {
    setError(true);
  } finally {
    setIsLoading(false);
  }
}
