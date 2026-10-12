import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

import BackButton from "../assets/icons/BackButton.svg";
import avatarImg from "../assets/icons/avatar.svg";

import { API_BASE_URL } from "../config/api.js";
import { useTheme } from "../contexts/ThemeContext.jsx";
import "../styles/Chat.css";

export const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
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

          const messagesRes = await fetch(`${API_BASE_URL}/api/chat/messages/${targetId}`, {
            credentials: "include",
          });
          if (messagesRes.status === 401) {
            navigate("/login", { replace: true });
            return;
          }
          if (!messagesRes.ok) throw new Error("Could not load messages.");

          const messagesResult = await messagesRes.json();
          const targetMessages = Array.isArray(messagesResult.messages)
            ? messagesResult.messages
            : [];

          if (!refreshQueued && active) {
            setConversations(
              loaded.map((conversation) =>
                conversation.id === targetId
                  ? { ...conversation, messages: targetMessages, unread: 0 }
                  : conversation
              )
            );
            setLoading(false);
            setChatError("");
          }
        }
      } catch (err) {
        if (active) {
          setChatError(err.message || "Failed to update chat.");
          setLoading(false);
        }
      } finally {
        refreshRunning = false;
      }
    };

    refreshRef.current = refreshChat;
    void refreshChat();

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      void refreshRef.current?.();
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
    });

    socket.on("chat:message", (data) => {
      if (data.chatId === selectedIdRef.current) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== data.chatId) return c;
            return {
              ...c,
              messages: [...(c.messages || []), data.message],
              preview: data.message.text,
              time: data.message.time,
            };
          })
        );
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === data.chatId
              ? {
                  ...c,
                  preview: data.message.text,
                  time: data.message.time,
                  unread: (c.unread || 0) + 1,
                }
              : c
          )
        );
      }
    });

    return () => {
      active = false;
      refreshRef.current = null;
      socket.disconnect();
    };
  }, [currentUser, incomingChatId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedId]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const handleSelectConversation = (id) => {
    if (sending) return;
    selectedIdRef.current = id;
    setSelectedId(id);
    void refreshRef.current?.();
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const text = messageInput.trim();
    if (!text || sending || !selectedId) return;

    const chatId = selectedId;
    sendingRef.current = true;
    setSending(true);
    setSendError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    <div className="bg-white dark:bg-[#0f0f11] text-black dark:text-white min-h-screen flex flex-col transition-colors">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212]">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center hover:opacity-80 p-1"
            aria-label="Back"
          >
            <img src={BackButton} alt="Back" className="w-5 h-5 sm:w-6 sm:h-6 dark:invert" />
          </button>
          <div
            className="cursor-pointer flex items-baseline"
            onClick={() => navigate(currentUser ? "/landing-login" : "/")}
          >
            <span className="text-[#c90202] font-subheading text-2xl">Thapar</span>
            <span className="text-black dark:text-white font-subheading text-2xl">Kart</span>
          </div>
        </div>

        {/* Theme toggle in Chat */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-neutral-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Conversations Sidebar (Hidden on mobile if conversation is selected) */}
        <aside
          className={`${
            selectedId ? "hidden md:flex" : "flex"
          } w-full md:w-[320px] lg:w-[360px] shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#151518] flex-col transition-colors`}
        >
          <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-black dark:text-white">Chats</h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {socketConnected ? "Online" : "Connecting..."}
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !loading && (
              <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No active conversations yet. Reach out to a seller from any listing!
              </div>
            )}
            {conversations.map((conv) => {
              const isActive = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-neutral-200/50 dark:border-neutral-800/60 transition-colors ${
                    isActive
                      ? "bg-white dark:bg-neutral-800/90 shadow-xs"
                      : "bg-[#f7f7f7] dark:bg-[#151518] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                    <img src={avatarImg} alt="Avatar" className="w-8 h-8 object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-black dark:text-white truncate">
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 shrink-0">
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate w-[80%]">
                        {conv.preview || "No messages yet"}
                      </span>
                      {conv.unread > 0 && (
                        <span className="min-w-[18px] h-[18px] rounded-full bg-[#c90202] text-[10px] text-white flex items-center justify-center px-1 font-bold">
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

        {/* Message Thread Section (Hidden on mobile if no conversation is selected) */}
        <section
          className={`${
            !selectedId ? "hidden md:flex" : "flex"
          } flex-1 min-w-0 flex-col bg-[#fafafa] dark:bg-[#101013] transition-colors`}
        >
          {chatError ? (
            <div
              className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 p-6"
              role="alert"
            >
              <p>{chatError}</p>
              <button
                type="button"
                onClick={() => void refreshRef.current?.()}
                className="underline text-black dark:text-white"
              >
                Retry
              </button>
            </div>
          ) : !selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 p-6">
              {loading ? "Loading chats..." : "Select a chat to start messaging."}
            </div>
          ) : (
            <>
              {/* Chat Thread Header */}
              <div className="px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex items-center gap-3">
                {/* Mobile Back Button to list */}
                <button
                  type="button"
                  onClick={() => {
                    selectedIdRef.current = null;
                    setSelectedId(null);
                  }}
                  className="md:hidden p-1 mr-1 text-black dark:text-white hover:opacity-75"
                  aria-label="Back to conversations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                  <img src={avatarImg} alt="Avatar" className="w-7 h-7 object-cover" />
                </div>
                <div className="font-semibold text-sm text-black dark:text-white truncate">
                  {selectedConversation.name}
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 min-w-0 px-4 sm:px-6 py-4 overflow-y-auto space-y-3.5">
                {(selectedConversation.messages || []).map((msg, idx) => {
                  const isMe = msg.from === "me";
                  return (
                    <div
                      key={msg._id || `${msg.timestamp || msg.time}-${idx}`}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[82%] sm:max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? "bg-black text-white dark:bg-white dark:text-black rounded-br-none"
                              : "bg-white text-black dark:bg-neutral-800 dark:text-white rounded-bl-none border border-neutral-200/80 dark:border-neutral-700"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 px-1">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={handleSend}
                className="min-w-0 px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] flex gap-2.5"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Type a message…"
                  disabled={sending}
                  style={{ minWidth: 0 }}
                  aria-label="Message"
                  className="flex-1 px-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm outline-none bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white transition"
                />
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold rounded-full shadow-button-shadow hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 disabled:opacity-50 transition cursor-pointer"
                >
                  Send
                </button>
              </form>
              {sendError && (
                <p role="alert" className="px-4 pb-3 text-sm text-[#c90202]">
                  {sendError}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;
