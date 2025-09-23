import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io(import.meta.env.VITE_API_URL);

export default function Chat({ workspaceId, token, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (!workspaceId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/chats/${workspaceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();

    socket.emit("joinRoom", workspaceId);

    socket.on("newMessage", (msg) => {
      if (msg.workspace === workspaceId) setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leaveRoom", workspaceId);
      socket.off("newMessage");
    };
  }, [workspaceId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/chats/${workspaceId}`,
        { content: newMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMsg("");
      socket.emit("sendMessage", res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto border p-2 mb-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-1 p-1 rounded ${
              msg.sender === userId
                ? "bg-blue-200 self-end"
                : "bg-gray-200 self-start"
            }`}
          >
            <strong>{msg.senderName || "User"}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
