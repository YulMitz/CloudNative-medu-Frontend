import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";
import useMessageHistory from "../hook/useMessageHistory";
import useNickname from "../hook/useNickname";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useWebSocketStore } from "../store/useWebsocket";
import Profile_header from "../assets/profile_photo.png";

type message = {
  id: string;
  sender: string;
  content: string;
};

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const target = searchParams.get("friendID");
  const { data: messages, status: messageStatus } = useMessageHistory(target!);
  const { data: nickname, status: nicknameStatus } = useNickname(target!);
  const [sendcontent, setSendcontent] = useState<message[]>([]);
  const chatroomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLInputElement>(null);
  const ws = useWebSocketStore().socket;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("收到服務器消息:", data);

        // 確保消息來自當前聊天對象
        if (data.fromUserId === target) {
          setSendcontent((prev) => [
            {
              id: new Date().toISOString(),
              sender: data.fromUserId,
              content: data.message,
            },
            ...prev,
          ]);
        }
      } catch (err) {
        console.error("無法解析服務器消息:", event.data, err);
      }
    };

    ws!.addEventListener("message", handleMessage);

    return () => {
      ws!.removeEventListener("message", handleMessage);
    };
  }, [ws, target]);

  useEffect(() => {
    return () => {
      setSendcontent([]);
    };
  }, [target]);

  useEffect(() => {
    if (chatroomRef.current) {
      chatroomRef.current.scrollTop = chatroomRef.current.scrollHeight;
    }
  }, [sendcontent, messages]);

  const sendMessage = () => {
    if (contentRef.current?.value.trim()) {
      const value = contentRef.current.value.trim();
      ws!.send(
        JSON.stringify({
          message: value,
          targetUserId: target,
        })
      );
      setSendcontent((prev) => [
        { id: new Date().toISOString(), sender: "me", content: value },
        ...prev,
      ]);
      contentRef.current.value = "";
    }
  };

  if (messageStatus === "pending" || nicknameStatus === "pending") {
    return <div>loading...</div>;
  }

  if (target === null) {
    return (
      <div className="text-center text-5xl h-[94vh] m-auto w-1/2 content-center">
        選擇聊天對象
      </div>
    );
  }

  return (
    <div className="flex flex-col border grow rounded-md p-2">
      {/* Message Target Info Section */}
      <div className="flex p-2 border w-full min-h-20 m-0.5">
        <div className="rounded-full w-[8%] m-auto">
          <img src={Profile_header} alt="Profile" />
        </div>
        <div className="w-[85%] text-5xl px-10 my-auto">
          {nickname?.nickname}
        </div>
      </div>

      {/* Chatbox Section */}
      <div
        className="w-full flex-grow overflow-y-scroll border no-scrollbar m-0.5"
        ref={chatroomRef}
      >
        <div className="flex space-y-2 flex-col-reverse">
          {messages?.messageHistory.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.fromUserId === target ? "justify-start" : "justify-end"
              } m-2`}
            >
              <div
                className={`${
                  message.fromUserId === target
                    ? "bg-[#bf8e68]"
                    : "bg-[#ffdeaa]"
                } text-4xl text-black p-4 rounded-full max-w-5xl`}
              >
                {message.message}
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-y-2 flex-col-reverse">
          {sendcontent?.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === target ? "justify-start" : "justify-end"
              } m-2`}
            >
              <div
                className={`${
                  message.sender === target ? "bg-[#bf8e68]" : "bg-[#ffdeaa]"
                } text-4xl text-black p-4 rounded-full max-w-5xl`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input Section */}
      <div className="flex p-2 border w-full min-h-12 m-0.5">
        <input
          type="text"
          placeholder="輸入訊息..."
          className="bg-[#fefefe] rounded-full h-16 w-[90%] text-3xl px-3 block"
          ref={contentRef}
        />
        <HiOutlinePaperAirplane
          className="text-6xl w-[10%] text-left cursor-pointer"
          onClick={sendMessage}
        />
      </div>
    </div>
  );
}

export default React.memo(ChatRoom);

// <div className="h-[94vh]">
//   <div className="flex rounded-md p-2 my-auto h-[15%] border-gray-400 border-b-2">
//     <div className="rounded-full w-[8%] m-auto">
//       <img src={Profile_header} alt="Profile" />
//     </div>
//     <div className="w-[85%] text-5xl px-10 my-auto">
//       {nickname?.nickname}
//     </div>
//   </div>

//   <div className="flex-1 overflow-y-scroll h-[74%] p-4" ref={chatroomRef}>
// <div className="flex space-y-2 flex-col-reverse">
//   {messages?.messageHistory.map((message) => (
//     <div
//       key={message._id}
//       className={`flex ${
//         message.fromUserId === target ? "justify-start" : "justify-end"
//       } m-2`}
//     >
//       <div
//         className={`${
//           message.fromUserId === target
//             ? "bg-[#bf8e68]"
//             : "bg-[#ffdeaa]"
//         } text-4xl text-black p-4 rounded-full max-w-5xl`}
//       >
//         {message.message}
//       </div>
//     </div>
//   ))}
// </div>
// <div className="flex space-y-2 flex-col-reverse">
//   {sendcontent?.map((message) => (
//     <div
//       key={message.id}
//       className={`flex ${
//         message.sender === target ? "justify-start" : "justify-end"
//       } m-2`}
//     >
//       <div
//         className={`${
//           message.sender === target ? "bg-[#bf8e68]" : "bg-[#ffdeaa]"
//         } text-4xl text-black p-4 rounded-full max-w-5xl`}
//       >
//         {message.content}
//       </div>
//     </div>
//   ))}
// </div>
//   </div>

//   <div className="bg-gray-50 rounded-md p-4 my-auto w-full flex absolute bottom-0">
//     <div className="w-full m-auto flex">
// <input
//   type="text"
//   placeholder="輸入訊息..."
//   className="bg-[#fefefe] rounded-full h-16 w-[90%] text-3xl px-3 block"
//   ref={contentRef}
// />
// <HiOutlinePaperAirplane
//   className="text-6xl w-[10%] text-left cursor-pointer"
//   onClick={sendMessage}
// />
//     </div>
//   </div>
// </div>;
