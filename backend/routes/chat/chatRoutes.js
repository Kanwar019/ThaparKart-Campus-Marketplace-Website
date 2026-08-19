import express from "express";
import Chat from "../../models/Chat.js";
// ✅ Import 'authRequired' and alias it as 'verifyToken'
import { authRequired as verifyToken } from "../../middleware/authMiddleware.js"; 

const router = express.Router();

// 1. Get all conversations (With real unread counts)
router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id; // from verifyToken

    // Find chats where current user is a participant
    const chats = await Chat.find({
      participants: currentUserId,
    })
      .populate("participants", "name email") // get name of other user
      .sort({ lastUpdated: -1 });

    // Format for frontend
    const formatted = chats.map((chat) => {
      // Find the "other" participant
      const otherUser = chat.participants.find(
        (p) => String(p._id) !== String(currentUserId)
      );

      // ✅ LOGIC: Calculate real unread count
      // Count messages where sender is NOT me AND read is false
      const unreadCount = chat.messages.reduce((acc, msg) => {
        const isFromOther = String(msg.sender) !== String(currentUserId);
        return isFromOther && !msg.read ? acc + 1 : acc;
      }, 0);

      return {
        id: chat._id,
        name: otherUser ? otherUser.name : "Unknown User",
        preview: chat.lastMessage || "No messages yet",
        time: new Date(chat.lastUpdated).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread: unreadCount, // ✅ Sending real count to frontend
        participants: chat.participants,
      };
    });

    res.json({ conversations: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 2. Get specific messages & MARK AS READ
router.get("/:id/messages", verifyToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // ✅ LOGIC: Mark unread messages from the other user as read
    let updatesMade = false;
    chat.messages.forEach((msg) => {
      const isFromOther = String(msg.sender) !== String(currentUserId);
      if (isFromOther && !msg.read) {
        msg.read = true;
        updatesMade = true;
      }
    });

    // Only save to DB if we actually marked something as read
    if (updatesMade) {
      await chat.save();
    }

    // Format messages for frontend
    const messages = chat.messages.map((msg) => ({
      _id: msg._id,
      text: msg.text,
      from: String(msg.sender) === String(currentUserId) ? "me" : "other",
      time: new Date(msg.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      senderId: msg.sender,
    }));

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 3. Send a message (Saved to DB + Emitted via Socket)
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { recipientId, text, chatId } = req.body;
    const senderId = req.user.id;

    let chat;

    // A. If chatId is provided, use it.
    if (chatId) {
      chat = await Chat.findById(chatId);
    }
    // B. If no chatId, check if a chat already exists between these two users
    else if (recipientId) {
      chat = await Chat.findOne({
        participants: { $all: [senderId, recipientId] },
      });
      // C. If still no chat, create a new one
      if (!chat) {
        chat = new Chat({
          participants: [senderId, recipientId],
          messages: [],
        });
      }
    }

    if (!chat) return res.status(400).json({ message: "Invalid Request" });

    // Add message
    const newMessage = {
      sender: senderId,
      text: text,
      timestamp: new Date(),
      read: false, // ✅ Explicitly set read to false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = text;
    chat.lastUpdated = new Date();
    await chat.save();

    // --- SOCKET.IO EMISSION ---
    const io = req.io;
    
    // Payload to send to clients
    const socketPayload = {
      conversationId: chat._id,
      message: {
        text: text,
        from: "other", // The receiver sees it as "other"
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        sender: senderId
      },
      recipientId: recipientId || chat.participants.find(p => String(p) !== String(senderId))
    };

    // Emit to the recipient's room
    io.to(String(socketPayload.recipientId)).emit("message", socketPayload);

    res.json({ success: true, chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// 4. Start/Get a conversation
router.post("/start", verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) return res.status(400).json({ message: "Recipient ID required" });

    // Check if chat exists
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    // If not, create new
    if (!chat) {
      chat = new Chat({
        participants: [senderId, recipientId],
        messages: [],
      });
      await chat.save();
    }

    res.json({ conversationId: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start chat" });
  }
});

export default router;