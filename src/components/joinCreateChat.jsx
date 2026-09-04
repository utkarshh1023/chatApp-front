import { useState } from "react";
import speak from "../assets/speak.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { FiArrowRight, FiHash, FiLock, FiUser } from "react-icons/fi";
const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      //join chat

      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("joined..");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status == 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in joining room");
        }
        console.log(error);
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      //create room
      console.log(detail);
      // call api to create room on backend
      try {
        const response = await createRoomApi(detail.roomId);
        console.log(response);
        toast.success("Room Created Successfully !!");
        //join the room
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);

        navigate("/chat");

        //forward to chat page...
      } catch (error) {
        console.log(error);
        if (error.status == 400) {
          toast.error("Room  already exists !!");
        } else {
          toast("Error in creating room");
        }
      }
    }
  }

  return (
    <main className="page-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <section className="glass-panel relative w-full max-w-5xl overflow-hidden rounded-[2rem]">
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent p-10 md:flex lg:p-14">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/15 ring-1 ring-cyan-300/30">
                  <img src={speak} className="h-7 w-7" alt="Chatter logo" />
                </div>
                <span className="text-lg font-semibold tracking-tight">Chatter</span>
              </div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                Conversations, simplified
              </p>
              <h1 className="max-w-sm text-4xl font-bold leading-tight text-white lg:text-5xl">
                Your people. Your space. Your conversations.
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
                Create a private room or join your team in seconds. No noise, just
                good conversations.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              Secure rooms ready to connect
            </div>
          </div>
          <div className="p-7 sm:p-10 lg:p-14">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15">
                <img src={speak} className="h-8 w-8" alt="Chatter logo" />
              </div>
              <span className="text-xl font-semibold">Chatter</span>
            </div>
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-cyan-300">Welcome in</p>
              <h2 className="text-3xl font-bold tracking-tight text-white">Enter a room</h2>
              <p className="mt-2 text-sm text-slate-400">
                Use an existing room or create a new one for your group.
              </p>
            </div>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                  Display name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    onChange={handleFormInputChange}
                    value={detail.userName}
                    type="text"
                    id="name"
                    name="userName"
                    placeholder="How should people call you?"
                    className="h-12 w-full rounded-xl border border-slate-700/80 bg-slate-950/40 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="roomId" className="mb-2 block text-sm font-medium text-slate-300">
                  Room ID
                </label>
                <div className="relative">
                  <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    name="roomId"
                    onChange={handleFormInputChange}
                    value={detail.roomId}
                    type="text"
                    id="roomId"
                    placeholder="e.g. design-team"
                    className="h-12 w-full rounded-xl border border-slate-700/80 bg-slate-950/40 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                onClick={joinChat}
                className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 active:scale-[0.98]"
              >
                Join room <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={createRoom}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/70 active:scale-[0.98]"
              >
                <FiLock /> Create new
              </button>
            </div>
            <p className="mt-7 text-center text-xs text-slate-500">
              Rooms are lightweight, private and made for focused conversations.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default JoinCreateChat;