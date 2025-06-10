"use client";

import React, { useEffect, useRef, useState } from "react";

const Chatbox = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      from: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      const botReply = {
        from: "bot",
        text: data.reply || "🤖 Sorry, no response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "❌ Failed to connect to AI.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 20px",
            borderRadius: "50px",
            backgroundColor: "#FF0800",
            color: "white",
            border: "none",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "320px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            maxHeight: "80vh",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#FF0800",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Cine Bot
            <button
              style={{
                float: "right",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              backgroundColor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      msg.from === "user" ? "#FC7676" : "#e5e7eb",
                    color: msg.from === "user" ? "white" : "black",
                    padding: "10px 14px",
                    borderRadius: "18px",
                    borderTopRightRadius: msg.from === "user" ? "0" : "18px",
                    borderTopLeftRadius: msg.from === "user" ? "18px" : "0",
                    fontSize: "14px",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#888",
                    marginTop: "4px",
                    textAlign: msg.from === "user" ? "right" : "left",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #ddd",
              backgroundColor: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "9999px",
                border: "1px solid #ccc",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                marginLeft: "8px",
                padding: "10px 14px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: "#FF0800",
                color: "white",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;
