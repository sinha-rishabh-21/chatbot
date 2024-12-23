"use client";
import { useState, useEffect, useRef, use } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import sendPostRequest from "@/components/fetch";
import generateId from "@/components/generateId";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  X,
  MessageCircle,
  Send,
  Loader2,
  MessageCircleOff,
  RotateCcw,
} from "lucide-react";

import { Message, useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";

function useStreamingMessage(content: string, delay = 50) {
  const [displayedContent, setDisplayedContent] = useState("");
  useEffect(() => {
    let index = 0;
    setDisplayedContent(""); // Clear content when a new message starts
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent((prev) => prev + content[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [content, delay]);

  return displayedContent;
}

export default function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [prevInput, setPrevInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const reload = () => {
    setError(false);
    sendPostRequest(
      messages,
      prevInput,
      setMessages,
      setIsLoading,
      setError
      //updateMessages
    );
  };

  const updateMessages = () => {
    if (input.length === 0) {
      return;
    }
    const stream: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };
    setMessages((prevMessages) => [...prevMessages, stream]);
  };

  const {
    //messages,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    //reload,
    //error,
  } = useChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex">
      <Button
        className="fixed bottom-4 right-4 z-50 bg-custom-blue text-primary-foreground"
        onClick={toggleChat}
        size="lg"
      >
        {isChatOpen ? <MessageCircleOff /> : <MessageCircle />}
      </Button>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-16 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <Card className="border-2">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-bold text-custom-blue">
                  <div className="flex">
                    Chat with ZenLearn AI{" "}
                    {/* <Image
                      src="@/assets/ZenLearnlogo.png"
                      alt="zenlearn"
                      width={20}
                      height={20}
                    /> */}
                  </div>
                </CardTitle>
                <Button
                  className="text-lg"
                  onClick={toggleChat}
                  size="sm"
                  variant="ghost"
                >
                  <X />
                </Button>
              </CardHeader>
              <CardContent>
                {/* <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}> */}
                <ScrollArea className="h-[400px] pr-4">
                  {messages.length === 0 && (
                    <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">
                      No messages yet.
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg p-1 ${
                          message.role === "user"
                            ? "bg-custom-blue text-primary-foreground px-2"
                            : "bg-blue-100"
                        }`}
                      >
                        <ReactMarkdown
                          children={message.content}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              return inline ? (
                                <code
                                  {...props}
                                  className="bg-gray-200 px-1 rounded"
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre
                                  {...props}
                                  className="bg-gray-200 p-2 rounded"
                                >
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                            ul: ({ children }) => (
                              <ul className="list-disc ml-4">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-4">{children}</ol>
                            ),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {error && (
                    <div className="w-full items-center flex justify-center gap-3">
                      <div>An error occurred.</div>
                      <Button
                        className="text-sm bg-custom-blue"
                        onClick={() => reload()}
                        size="sm"
                        variant="secondary"
                      >
                        Retry <RotateCcw />
                      </Button>
                    </div>
                  )}
                  <div ref={scrollRef}></div>
                </ScrollArea>
              </CardContent>

              <CardFooter>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (input.length === 0) {
                      return;
                    }
                    handleSubmit(event);
                    setError(false);
                    setPrevInput(input);
                    updateMessages();
                    sendPostRequest(
                      messages,
                      input,
                      setMessages,
                      setIsLoading,
                      setError
                      //updateMessages
                    );
                  }}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    className="flex-1"
                    placeholder="Type your message here..."
                    value={input}
                    onChange={handleInputChange}
                  />
                  <Button
                    className="size-9 bg-custom-blue"
                    type="submit"
                    disabled={isLoading}
                    onClick={() => {
                      if (isLoading) {
                        // Handle cancel logic here (e.g., stop the process)
                        stop(); // assuming stop() is a function you have to stop the process
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="relative flex items-center justify-center">
                        <Loader2 className="animate-spin absolute" />
                        <X className="relative z-10" /> {/* Static X button */}
                      </div>
                    ) : (
                      <Send />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// "use client";
// import { useState, useEffect, useRef, use } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Button } from "@/components/ui/button";
// //import sendPostRequest from "@/components/fetch";
// //import generateId from "@/components/generateId";
// //import Image from "next/image";

// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";

// import {
//   X,
//   MessageCircle,
//   Send,
//   Loader2,
//   MessageCircleOff,
//   RotateCcw,
// } from "lucide-react";

// import { Message, useChat } from "@ai-sdk/react";
// import { motion, AnimatePresence } from "framer-motion";
// import { streamText } from "ai";

// const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
//   const response = await fetch(url, options);
//   if (!response.ok) {
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   const fullResponse = await response.text();
//   const test = JSON.parse(fullResponse);

//   // Construct a new JSON object for the body

//   const newBody = {
//     id: "chatcmpl-abc123",
//     object: "chat.completion",
//     created: 1677652288,
//     model: "gpt-4",
//     message: {
//       role: "assistant",
//       content: test.output,
//     },
//   };

//   // Convert the new JSON object to a string
//   const newBodyString = JSON.stringify(newBody);

//   //Return a new Response object with the updated body
//   return new Response(newBodyString, {
//     status: response.status,
//     statusText: response.statusText,
//     headers: response.headers,
//   });
// };

// export default function ChatBot() {
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   //const [messages, setMessages] = useState<Message[]>([]);
//   //const [isLoading, setIsLoading] = useState<boolean>(false);
//   //const [error, setError] = useState<boolean>(false);
//   const [prevInput, setPrevInput] = useState<string>("");
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const toggleChat = () => {
//     setIsChatOpen(!isChatOpen);
//   };

//   // const reload = () => {
//   //   setError(false);
//   //   sendPostRequest(
//   //     messages,
//   //     prevInput,
//   //     setMessages,
//   //     setIsLoading,
//   //     setError
//   //     //updateMessages
//   //   );
//   // };

//   // const updateMessages = () => {
//   //   if (input.length === 0) {
//   //     return;
//   //   }
//   //   const stream: Message = {
//   //     id: generateId(),
//   //     role: "user",
//   //     content: input,
//   //   };
//   //   setMessages((prevMessages) => [...prevMessages, stream]);
//   // };

//   const {
//     messages,
//     input,
//     handleInputChange,
//     handleSubmit,
//     isLoading,
//     stop,
//     reload,
//     error,
//   } = useChat({
//     api: "http://localhost:3001/query",
//     fetch: customFetch,
//     body: {
//       query: "What is the capital of France?",
//     },
//   });

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   return (
//     <div className="flex">
//       <Button
//         className="fixed bottom-4 right-4 z-50 bg-custom-blue text-primary-foreground"
//         onClick={toggleChat}
//         size="lg"
//       >
//         {isChatOpen ? <MessageCircleOff /> : <MessageCircle />}
//       </Button>
//       <AnimatePresence>
//         {isChatOpen && (
//           <motion.div
//             initial={{ opacity: 0, x: 100 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 100 }}
//             transition={{ duration: 0.2 }}
//             className="fixed bottom-16 right-4 z-50 w-[95%] md:w-[500px]"
//           >
//             <Card className="border-2">
//               <CardHeader className="flex flex-row justify-between items-center">
//                 <CardTitle className="text-lg font-bold text-custom-blue">
//                   <div className="flex">
//                     Chat with ZenLearn AI{" "}
//                     {/* <Image
//                       src="@/assets/ZenLearnlogo.png"
//                       alt="zenlearn"
//                       width={20}
//                       height={20}
//                     /> */}
//                   </div>
//                 </CardTitle>
//                 <Button
//                   className="text-lg"
//                   onClick={toggleChat}
//                   size="sm"
//                   variant="ghost"
//                 >
//                   <X />
//                 </Button>
//               </CardHeader>
//               <CardContent>
//                 {/* <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}> */}
//                 <ScrollArea className="h-[400px] pr-4">
//                   {messages.length === 0 && (
//                     <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">
//                       No messages yet.
//                     </div>
//                   )}
//                   {messages.map((message, index) => (
//                     <div
//                       key={index}
//                       className={`mb-4 ${
//                         message.role === "user" ? "text-right" : "text-left"
//                       }`}
//                     >
//                       <div
//                         className={`inline-block rounded-lg p-1 ${
//                           message.role === "user"
//                             ? "bg-custom-blue text-primary-foreground px-2"
//                             : "bg-blue-100"
//                         }`}
//                       >
//                         <ReactMarkdown
//                           children={message.content}
//                           remarkPlugins={[remarkGfm]}
//                           components={{
//                             code({
//                               node,
//                               inline,
//                               className,
//                               children,
//                               ...props
//                             }) {
//                               return inline ? (
//                                 <code
//                                   {...props}
//                                   className="bg-gray-200 px-1 rounded"
//                                 >
//                                   {children}
//                                 </code>
//                               ) : (
//                                 <pre
//                                   {...props}
//                                   className="bg-gray-200 p-2 rounded"
//                                 >
//                                   <code>{children}</code>
//                                 </pre>
//                               );
//                             },
//                             ul: ({ children }) => (
//                               <ul className="list-disc ml-4">{children}</ul>
//                             ),
//                             ol: ({ children }) => (
//                               <ol className="list-decimal ml-4">{children}</ol>
//                             ),
//                           }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                   {error && (
//                     <div className="w-full items-center flex justify-center gap-3">
//                       <div>An error occurred.</div>
//                       <Button
//                         className="text-sm bg-custom-blue"
//                         onClick={() => reload()}
//                         size="sm"
//                         variant="secondary"
//                       >
//                         Retry <RotateCcw />
//                       </Button>
//                     </div>
//                   )}
//                   <div ref={scrollRef}></div>
//                 </ScrollArea>
//               </CardContent>

//               <CardFooter>
//                 <form
//                   // onSubmit={(event) => {
//                   //   event.preventDefault();
//                   //   if (input.length === 0) {
//                   //     return;
//                   //   }
//                   //   handleSubmit(event);
//                   //   //setError(false);
//                   //   setPrevInput(input);
//                   //   updateMessages();
//                   //   sendPostRequest(
//                   //     messages,
//                   //     input,
//                   //     setMessages,
//                   //     setIsLoading,
//                   //     setError
//                   //     //updateMessages
//                   //   );
//                   // }}
//                   onSubmit={handleSubmit}
//                   className="flex w-full items-center space-x-2"
//                 >
//                   <Input
//                     className="flex-1"
//                     placeholder="Type your message here..."
//                     value={input}
//                     onChange={handleInputChange}
//                   />
//                   <Button
//                     className="size-9 bg-custom-blue"
//                     type="submit"
//                     disabled={isLoading}
//                     onClick={() => {
//                       if (isLoading) {
//                         // Handle cancel logic here (e.g., stop the process)
//                         stop(); // assuming stop() is a function you have to stop the process
//                       }
//                     }}
//                   >
//                     {isLoading ? (
//                       <div className="relative flex items-center justify-center">
//                         <Loader2 className="animate-spin absolute" />
//                         <X className="relative z-10" /> {/* Static X button */}
//                       </div>
//                     ) : (
//                       <Send />
//                     )}
//                   </Button>
//                 </form>
//               </CardFooter>
//             </Card>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
