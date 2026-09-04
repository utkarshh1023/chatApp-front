import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { FiLogOut, FiMoreVertical, FiSearch, FiUsers } from "react-icons/fi";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";
const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  // console.log(roomId);
  // console.log(currentUser);
  // console.log(connected);

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  //page init:
  //messages ko load karne honge

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        // console.log(messages);
        setMessages(messages);
      } catch (error) {
        toast.error("Unable to load messages");
        console.error(error);
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [connected, roomId]);

  //scroll down

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //stompClient ko init karne honge
  //subscribe

  useEffect(() => {
    let activeClient = null;
    const connectWebSocket = () => {
      ///SockJS
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);
      activeClient = client;

      client.connect({}, () => {
        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

          //rest of the work after success receiving the message
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    return () => {
      if (activeClient?.connected) {
        activeClient.disconnect();
      }
    };
  }, [connected, roomId]);

  //send message handle

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);

      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }

    //
  };

  function handleLogout() {
    if (stompClient?.connected) {
      stompClient.disconnect();
    }
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-[#091525]/90 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-900/30">
              {roomId?.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#091525] bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{roomId}</p>
              <p className="flex items-center gap-1 text-xs text-emerald-300">
                <FiUsers size={12} /> Room is active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 sm:block">
              You: <strong className="text-white">{currentUser}</strong>
            </span>
            <button aria-label="Search messages" className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <FiSearch size={18} />
            </button>
            <button aria-label="More options" className="hidden h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white sm:grid">
              <FiMoreVertical size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
            >
              <FiLogOut size={16} /><span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </header>

      <main ref={chatBoxRef} className="chat-scrollbar mx-auto w-full max-w-5xl flex-1 overflow-auto px-4 pb-32 pt-8 sm:px-8">
        <div className="mb-8 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          <span className="rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1">Today</span>
          <span className="h-px flex-1 bg-slate-800" />
        </div>
        {messages.length === 0 && (
          <div className="mx-auto mt-20 max-w-sm text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-cyan-400/10 text-2xl">✦</div>
            <h2 className="text-lg font-semibold text-white">Start the conversation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Say hello to everyone in this room. Your messages will appear here.</p>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isMine = message.sender === currentUser;
            return (
              <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] items-end gap-2 sm:max-w-[70%] ${isMine ? "flex-row-reverse" : ""}`}>
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${isMine ? "bg-cyan-400/20 text-cyan-300" : "bg-violet-400/20 text-violet-300"}`}>
                    {message.sender?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${isMine ? "rounded-br-md bg-cyan-400 text-slate-950" : "rounded-bl-md border border-slate-700/80 bg-slate-800/80 text-slate-100"}`}>
                    <div className="mb-1 flex items-baseline gap-2">
                      <p className={`text-xs font-semibold ${isMine ? "text-cyan-950/70" : "text-cyan-300"}`}>{message.sender}</p>
                      <p className={`text-[10px] ${isMine ? "text-cyan-950/60" : "text-slate-500"}`}>{timeAgo(message.timeStamp)}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-slate-700/80 bg-[#0d1b2e]/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <button aria-label="Attach a file" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300">
            <MdAttachFile size={21} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            type="text"
            placeholder="Write a message..."
            className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <button
            onClick={sendMessage}
            aria-label="Send message"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 active:scale-95"
          >
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;