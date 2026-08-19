// src/pages/chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

import BackButton from "../assets/icons/BackButton.svg";
import avatarImg from "../assets/icons/avatar.svg";

import "../styles/Chat.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Real user data
  const [currentUser, setCurrentUser] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ FIXED: Changed /api/user/profile to /api/profile
        const res = await fetch(`${API_BASE_URL}/api/profile`, { 
            credentials: "include" 
        }); 
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || data); 
        } else {
            console.log("Not logged in");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // 2. Load Conversations (Only after we have currentUser)
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const loadedConvs = json.conversations || [];
          setConversations(loadedConvs);

          // If we navigated here with a specific conversationId (from Product Page), select that.
          // Otherwise, select the first one in the list.
          const incomingChatId = location.state?.conversationId;

          if (incomingChatId) {
            setSelectedId(incomingChatId);
          } else if (loadedConvs.length > 0) {
            setSelectedId(loadedConvs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    fetchConversations();
  }, [currentUser, location.state]);

  // 3. Connect Socket
  useEffect(() => {
    if (!currentUser) return;

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      // Join room with my User ID
      socket.emit("join", currentUser._id);
    });

    socket.on("disconnect", () => setSocketConnected(false));

    // Listen for incoming messages
    socket.on("message", (payload) => {
        const { conversationId, message } = payload;

        setConversations((prev) => {
            const index = prev.findIndex(c => c.id === conversationId);
            
            // If conversation exists
            if (index !== -1) {
                const updatedConvs = [...prev];
                const conv = { ...updatedConvs[index] };
                
                // Add message
                conv.messages = conv.messages ? [...conv.messages, message] : [message];
                conv.preview = message.text;
                conv.time = "Just now";
                
                // If not currently selected, mark unread
                if (conversationId !== selectedId) {
                    conv.unread = (conv.unread || 0) + 1;
                }

                updatedConvs.splice(index, 1);
                updatedConvs.unshift(conv); // Move to top
                return updatedConvs;
            } 
            // If new conversation (e.g. someone started chat with me)
            else {
                // Ideally fetch full conv, but here we ignore or trigger reload
                return prev; 
            }
        });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, selectedId]);

  // 4. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedId]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  // 5. Select Chat & Load Messages
  const handleSelectConversation = async (id) => {
    setSelectedId(id);
    
    // Optimistic update: mark read locally
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${id}/messages`, {
          credentials: "include"
      });
      if (res.ok) {
        const json = await res.json();
        setConversations(prev => prev.map(c => 
            c.id === id ? { ...c, messages: json.messages } : c
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Send Message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !currentUser) return;

    const text = messageInput.trim();
    setMessageInput(""); // Clear input immediately

    // Optimistic UI Update
    const tempMsg = {
        text,
        from: "me",
        time: "...", 
    };

    setConversations(prev => prev.map(c => {
        if (c.id === selectedConversation.id) {
            const msgs = c.messages ? [...c.messages, tempMsg] : [tempMsg];
            return { ...c, messages: msgs, preview: text, time: "Now" };
        }
        return c;
    }));

    try {
        const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                chatId: selectedConversation.id,
                text: text,
                // find the other participant ID
                recipientId: selectedConversation.participants.find(p => p._id !== currentUser._id)?._id
            })
        });

        if (!res.ok) {
            console.error("Failed to send");
        }
    } catch (err) {
        console.error("Error sending message:", err);
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

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-[30%] min-w-[260px] border-r border-[#0000001a] bg-[#f7f7f7] flex flex-col">
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

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-[#fafafa]">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[#777]">
              Select a chat to start messaging.
            </div>
          ) : (
            <>
              <div className="px-6 py-3 border-b border-[#0000001a] bg-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e0e0e0] flex items-center justify-center">
                   <img src={avatarImg} alt="Avatar" className="w-7 h-7 object-cover" />
                </div>
                <div className="font-medium text-sm">{selectedConversation.name}</div>
              </div>

              <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
                {(selectedConversation.messages || []).map((msg, idx) => {
                  const isMe = msg.from === "me";
                  return (
                    <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
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

              <form onSubmit={handleSend} className="px-4 py-3 border-t border-[#0000001a] bg-white flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2 rounded-full border border-[#0000001a] text-sm outline-none bg-[#fdfdfd]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-sm rounded-full shadow-button-shadow hover:bg-[#1a1a1a]"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;