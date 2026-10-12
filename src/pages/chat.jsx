import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

import BackButton from "../assets/icons/BackButton.svg";
import avatarImg from "../assets/icons/avatar.svg";

import { API_BASE_URL } from "../config/api.js";
import "../styles/Chat.css";

export const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingChatId = location.state?.conversationId;

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const selectedIdRef = useRef(null);
  const refreshRef = useRef(null);
  const sendingRef = useRef(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: "include",
        });
        if (res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) throw new Error("Could not load your profile.");

        const profile = await res.json();
        if (active) {
          setCurrentUser({ ...profile, _id: profile._id ?? profile.id });
        }
      } catch {
        if (active) setChatError("Could not load your profile. Please try again.");
      }
    };

    fetchProfile();
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return undefined;

    let active = true;
    let refreshQueued = false;
    let refreshRunning = false;

    const refreshChat = async () => {
      refreshQueued = true;
      if (refreshRunning) return;
      refreshRunning = true;

      try {
        while (active && refreshQueued) {
          refreshQueued = false;

          const conversationsRes = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
            credentials: "include",
          });
          if (conversationsRes.status === 401) {
            navigate("/login", { replace: true });
            return;
          }
          if (!conversationsRes.ok) throw new Error("Could not load your chats.");

          const result = await conversationsRes.json();
          const loaded = Array.isArray(result.conversations) ? result.conversations : [];
          const activeId = selectedIdRef.current;
          const targetId = activeId || incomingChatId || loaded[0]?.id || null;

          if (!activeId && targetId) {
            selectedIdRef.current = targetId;
            setSelectedId(targetId);
          }

          if (!loaded.some((conversation) => conversation.id === targetId)) {
            if (!refreshQueued && active) {
              setConversations(loaded);
              setLoading(false);
              setChatError("");
            }
            continue;
          }

          const messagesRes = await fetch(`${API_BASE_URL}/api/chat/${targetId}/messages`, {
            credentials: "include",
          });
          if (messagesRes.status === 401) {
            navigate("/login", { replace: true });
            return;
          }
          if (!messagesRes.ok) throw new Error("Could not load this conversation.");

          const messagesResult = await messagesRes.json();
          if (!active || refreshQueued || selectedIdRef.current !== targetId) continue;

          setConversations(loaded.map((conversation) => conversation.id === targetId
            ? { ...conversation, messages: messagesResult.messages || [], unread: 0 }
            : conversation));
          setLoading(false);
          setChatError("");
        }
      } catch (error) {
        if (active) {
          setLoading(false);
          setChatError(error.message || "Could not load your chats. Please try again.");
        }
      } finally {
        refreshRunning = false;
        if (active && refreshQueued) void refreshChat();
      }
    };

    refreshRef.current = refreshChat;

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      // The server assigns this connection's room from its verified session.
      // Refreshing here recovers messages missed during a disconnect.
      void refreshChat();
    });
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("message", () => { void refreshChat(); });
    socket.connect();

    void refreshChat();

    return () => {
      active = false;
      refreshRef.current = null;
      socket.disconnect();
    };
  }, [currentUser, incomingChatId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedId]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);

  const handleSelectConversation = (id) => {
    if (sendingRef.current || selectedIdRef.current === id) return;
    selectedIdRef.current = id;
    setSelectedId(id);
    setMessageInput("");
    setSendError("");
    setLoading(true);
    setChatError("");
    void refreshRef.current?.();
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const text = messageInput.trim();
    const chatId = selectedIdRef.current;
    if (!text || !chatId || !currentUser || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setSendError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // The server derives the recipient from the conversation participants.
        body: JSON.stringify({ chatId, text }),
      });
      if (!res.ok) throw new Error("Message could not be sent.");

      setMessageInput((draft) => draft.trim() === text ? "" : draft);
      void refreshRef.current?.();
    } catch {
      setSendError("Could not confirm delivery. Your draft is still here; check the chat before retrying.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-[#0000001a]">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center hover:opacity-80">
            <img src={BackButton} alt="Back" className="w-6 h-6" />
          </button>
          <div className="cursor-pointer" onClick={() => navigate("/landing-login")}>
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-[30%] min-w-[120px] sm:min-w-[260px] border-r border-[#0000001a] bg-[#f7f7f7] flex flex-col">
          <div className="px-4 py-3 border-b border-[#0000001a]">
            <h2 className="font-semibold text-sm">Chats</h2>
            <p className="text-[11px] text-[#777] mt-1">
              {socketConnected ? "Online" : "Connecting..."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const isActive = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#0000000d] ${
                    isActive ? "bg-white" : "bg-[#f7f7f7] hover:bg-[#ececec]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center">
                    <img src={avatarImg} alt="Avatar" className="w-8 h-8 object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm truncate">{conv.name}</span>
                      <span className="text-[10px] text-[#888]">{conv.time}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] text-[#666] truncate w-[80%]">{conv.preview}</span>
                      {conv.unread > 0 && (
                        <span className="min-w-[18px] h-[18px] rounded-full bg-[#c90202] text-[10px] text-white flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 min-w-0 flex flex-col bg-[#fafafa]">
          {chatError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-[#777]" role="alert">
              <p>{chatError}</p>
              <button type="button" onClick={() => void refreshRef.current?.()} className="underline">
                Retry
              </button>
            </div>
          ) : !selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[#777]">
              {loading ? "Loading chats..." : "Select a chat to start messaging."}
            </div>
          ) : (
            <>
              <div className="px-6 py-3 border-b border-[#0000001a] bg-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e0e0e0] flex items-center justify-center">
                  <img src={avatarImg} alt="Avatar" className="w-7 h-7 object-cover" />
                </div>
                <div className="font-medium text-sm">{selectedConversation.name}</div>
              </div>

              <div className="flex-1 min-w-0 px-6 py-4 overflow-y-auto space-y-4">
                {(selectedConversation.messages || []).map((msg, idx) => {
                  const isMe = msg.from === "me";
                  return (
                    <div key={msg._id || `${msg.timestamp || msg.time}-${idx}`} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-black text-white rounded-br-none"
                              : "bg-white text-black rounded-bl-none border border-[#00000010]"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="mt-1 text-[10px] text-[#777]">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="min-w-0 px-4 py-3 border-t border-[#0000001a] bg-white flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Type a message…"
                  disabled={sending}
                  style={{ minWidth: 0 }}
                  aria-label="Message"
                  className="flex-1 px-4 py-2 rounded-full border border-[#0000001a] text-sm outline-none bg-[#fdfdfd]"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-black text-white text-sm rounded-full shadow-button-shadow hover:bg-[#1a1a1a]"
                >
                  Send
                </button>
              </form>
              {sendError && <p role="alert" className="px-4 pb-3 text-sm text-[#c90202]">{sendError}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;
