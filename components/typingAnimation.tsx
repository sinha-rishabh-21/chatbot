import { useEffect, useState } from "react";

export default function useTypingEffect(message: string, delay: number = 100) {
  const [typedContent, setTypedContent] = useState<string>("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedContent((prev) => prev + message[index]);
      index += 1;
      if (index === message.length) {
        clearInterval(interval); // Stop typing when the message is fully revealed
      }
    }, delay);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [message, delay]);

  return typedContent;
}
