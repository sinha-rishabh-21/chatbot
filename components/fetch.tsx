import { Message } from "ai";
import generateId from "./generateId";
import buildMessageArray from "./buildMessage";

export default async function sendPostRequest(
  messages: Message[],
  input: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<boolean>>
  //updateMessages: () => void
) {
  setIsLoading(true);
  try {
    // const response = await fetch("http://localhost:3001/query", {
    const response = await fetch("https://coach.zenlearn.ai/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: buildMessageArray(messages, input) }),
    });

    if (!response.ok) {
      //throw new Error("Network response was not ok");
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

    //updateMessages();
    // Use setMessages to update the messages state immutably
    setMessages((prevMessages) => [...prevMessages, stream]); // Create a new array by spreading the previous messages and adding the new one
    setIsLoading(false);
  } catch (error) {
    //console.error("Error:", error);
    setIsLoading(false);
    setError(true);
  }
}
