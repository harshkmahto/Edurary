import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Send,
  ShieldCheck,
  MessageSquare,
  Image,
  Smile,
  ChevronDown,
  Users,
} from "lucide-react";

const AdminMessage = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "admin",
      text: "Welcome to EDURARY! 🎉 Start your learning journey today.",
      time: "10:20 AM",
      recipients: "All Users"
    },
    {
      id: 2,
      sender: "admin",
      text: "New courses added: React, Node.js, and Python. Check them out!",
      time: "Yesterday",
      recipients: "Subscribers"
    },
    {
      id: 3,
      sender: "admin",
      text: "Maintenance scheduled for Sunday 2 AM - 4 AM. Service may be unavailable.",
      time: "Yesterday",
      recipients: "All Users"
    },
    {
      id: 4,
      sender: "admin",
      text: "🎊 50% off on all courses this weekend only! Use code: EDURARY50",
      time: "2 days ago",
      recipients: "All Users"
    },
    {
      id: 5,
      sender: "admin",
      text: "Your subscription will expire in 7 days. Please renew to continue learning.",
      time: "2 days ago",
      recipients: "Subscribers"
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    setShowScrollDown(false);
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollDown(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newMessage = {
      id: Date.now(),
      sender: "admin",
      text: trimmedMessage,
      time: "Just now",
      recipients: "All Users",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50  backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Popup */}
      <div className="fixed inset-0 z-50 flex items-start justify-end m-8 mt-14 animate-fade-in">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            relative
            w-full
            max-w-[420px]
            mx-4
            bg-white/10
            dark:bg-black/10
            rounded-2xl
            border
            border-[#22c55e]/30
            dark:border-[#4ade80]/20
            shadow-[0_20px_60px_rgba(34,197,94,0.15)]
            dark:shadow-[0_20px_80px_rgba(34,197,94,0.1)]
            animate-scale-up
            max-h-[72vh]
            flex
            flex-col
          "
        >
          {/* Subtle Glow Effects */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#22c55e]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#16a34a]/5 blur-3xl" />

          {/* ================= HEADER ================= */}
          <div
            className="
              relative
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              border-[#22c55e]/20
              dark:border-[#4ade80]/15
              bg-white/80
              dark:bg-[#0a0f0b]/80
              backdrop-blur-xl
              rounded-t-2xl
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-10 h-10
                  rounded-xl
                  flex items-center justify-center
                  bg-gradient-to-br from-[#22c55e] to-[#16a34a]
                  shadow-[0_0_20px_rgba(34,197,94,0.2)]
                "
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#173b1d] dark:text-[#dcfce7]">
                  Send Notification
                </h2>
                <p className="text-xs text-[#4b6b50] dark:text-[#6b8b6b]">
                  Broadcast messages to users
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="
                w-8 h-8
                rounded-xl
                flex items-center justify-center
                text-[#527052] dark:text-[#6b8b6b]
                bg-[#22c55e]/5 dark:bg-[#22c55e]/5
                border border-[#22c55e]/10
                hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500
                transition-all duration-200
              "
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ================= RECIPIENT SELECTOR ================= */}
          <div
            className="
              relative
              flex items-center gap-3
              px-5 py-3
              border-b border-[#22c55e]/15 dark:border-[#4ade80]/10
              bg-[#22c55e]/[0.03] dark:bg-[#22c55e]/[0.02]
            "
          >
            <div
              className="
                w-9 h-9 rounded-full
                flex items-center justify-center shrink-0
                bg-gradient-to-br from-[#22c55e] to-[#15803d]
                shadow-[0_0_15px_rgba(34,197,94,0.2)]
              "
            >
              <Users className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#173b1d] dark:text-[#dcfce7]">
                  Send to: All Users
                </h3>
                <span
                  className="
                    px-2 py-0.5 rounded
                    text-[9px] font-medium
                    text-[#15803d] dark:text-[#86efac]
                    bg-[#22c55e]/10 dark:bg-[#22c55e]/10
                    border border-[#22c55e]/20
                  "
                >
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#5b765f] dark:text-[#6b8b6b]">
                  Recipients: <strong>1,247</strong> users
                </span>
                <span className="w-1 h-1 rounded-full bg-[#22c55e]/30" />
                <span className="text-[10px] text-[#5b765f] dark:text-[#6b8b6b]">
                  Click to change
                </span>
              </div>
            </div>
          </div>

          {/* ================= NOTIFICATION LIST ================= */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="
              flex-1
              overflow-y-auto
              px-4 py-4
              custom-message-scrollbar
              bg-gradient-to-b
              from-[#f0fdf4]/10 via-transparent to-[#dcfce7]/5
              dark:from-[#052e16]/5 dark:via-transparent dark:to-[#052e16]/5
              min-h-[200px]
            "
          >
            <div className="flex justify-center mb-4">
              <span
                className="
                  px-3 py-1 rounded-full
                  text-[9px] font-medium uppercase tracking-wider
                  text-[#527052] dark:text-[#6b8b6b]
                  bg-[#22c55e]/5 dark:bg-[#22c55e]/5
                  border border-[#22c55e]/10
                "
              >
                Sent Notifications
              </span>
            </div>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="
                    flex items-start gap-3
                    p-3
                    rounded-xl
                    bg-white/70 dark:bg-white/[0.04]
                    backdrop-blur-sm
                    border border-[#22c55e]/10 dark:border-[#4ade80]/10
                    hover:bg-white/90 dark:hover:bg-white/[0.06]
                    transition-all duration-200
                  "
                >
                  {/* Admin Avatar */}
                  <div
                    className="
                      w-8 h-8 rounded-full shrink-0
                      flex items-center justify-center
                      bg-gradient-to-br from-[#22c55e] to-[#15803d]
                      shadow-[0_0_15px_rgba(34,197,94,0.15)]
                    "
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#173b1d] dark:text-[#dcfce7]">
                          EDURARY Admin
                        </h4>
                        <span
                          className="
                            px-1.5 py-0.5 rounded
                            text-[8px] font-medium
                            text-[#15803d] dark:text-[#86efac]
                            bg-[#22c55e]/10 dark:bg-[#22c55e]/10
                          "
                        >
                          Admin
                        </span>
                      </div>
                      <span className="text-[9px] text-[#77907b] dark:text-[#6b8b6b] whitespace-nowrap">
                        {msg.time}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#29482e] dark:text-[#d1e7d5] leading-relaxed mt-1">
                      {msg.text}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[8px] text-[#77907b] dark:text-[#6b8b6b]">
                        Sent to: <strong className="text-[#173b1d] dark:text-[#dcfce7]">{msg.recipients}</strong>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#22c55e]/30" />
                      <span className="text-[8px] text-[#22c55e] dark:text-[#4ade80]">
                        ✓ Delivered
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll Down Button */}
            {showScrollDown && (
              <button
                onClick={scrollToBottom}
                className="
                  absolute bottom-4 left-1/2 -translate-x-1/2
                  w-8 h-8 rounded-full
                  bg-white dark:bg-[#0a0f0b]
                  border border-[#22c55e]/30 dark:border-[#4ade80]/20
                  shadow-[0_2px_15px_rgba(34,197,94,0.15)]
                  flex items-center justify-center
                  hover:bg-[#22c55e]/5
                  transition-all duration-200
                  animate-bounce
                  z-10
                "
              >
                <ChevronDown className="w-4 h-4 text-[#16a34a] dark:text-[#4ade80]" />
              </button>
            )}
          </div>

          {/* ================= MESSAGE INPUT ================= */}
          <div
            className="
              relative
              px-4 py-3
              border-t border-[#22c55e]/20 dark:border-[#4ade80]/15
              bg-white/90 dark:bg-[#0a0f0b]/90
              backdrop-blur-2xl
              rounded-b-2xl
            "
          >
            <form
              onSubmit={handleSendMessage}
              className="
                flex items-end gap-2
                p-1.5
                rounded-xl
                bg-white/80 dark:bg-white/[0.04]
                backdrop-blur-xl
                border border-[#22c55e]/25 dark:border-[#4ade80]/20
                focus-within:border-[#22c55e]/60 dark:focus-within:border-[#4ade80]/50
                focus-within:shadow-[0_0_25px_rgba(34,197,94,0.08)]
                transition-all duration-300
              "
            >
              {/* Left Icons */}
              <div className="flex items-center gap-0.5 pl-0.5">
                <button
                  type="button"
                  className="
                    w-8 h-8 rounded-lg
                    flex items-center justify-center
                    text-[#7b927f] dark:text-[#5f7563]
                    hover:bg-[#22c55e]/5 hover:text-[#16a34a]
                    transition-colors duration-200
                  "
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="
                    w-8 h-8 rounded-lg
                    flex items-center justify-center
                    text-[#7b927f] dark:text-[#5f7563]
                    hover:bg-[#22c55e]/5 hover:text-[#16a34a]
                    transition-colors duration-200
                  "
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Input */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type your notification message..."
                className="
                  flex-1 min-w-0 resize-none
                  bg-transparent outline-none border-none
                  px-2 py-1.5
                  text-sm
                  text-[#173b1d] dark:text-[#dcfce7]
                  placeholder:text-[#7b927f] dark:placeholder:text-[#5f7563]
                  max-h-24 overflow-y-auto
                "
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim()}
                aria-label="Send notification"
                className="
                  w-9 h-9 shrink-0 rounded-lg
                  flex items-center justify-center
                  bg-gradient-to-br from-[#22c55e] to-[#16a34a]
                  text-white
                  shadow-[0_3px_15px_rgba(34,197,94,0.2)]
                  hover:shadow-[0_3px_25px_rgba(34,197,94,0.35)]
                  hover:scale-105
                  active:scale-95
                  disabled:opacity-40 disabled:cursor-not-allowed
                  disabled:hover:scale-100
                  transition-all duration-200
                "
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-[8px] text-[#819582] dark:text-[#526354]">
                Enter to send • Shift+Enter for new line
              </p>
              <p className="text-[8px] text-[#819582] dark:text-[#526354]">
                Will be sent to all users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .custom-message-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-message-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-message-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 20px;
        }
        .custom-message-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.4);
        }
        .custom-message-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.2) transparent;
        }

        @keyframes admin-message-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes admin-message-scale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: admin-message-fade 0.2s ease-out;
        }
        .animate-scale-up {
          animation: admin-message-scale 0.25s ease-out;
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }
      `}</style>
    </>
  );
};

export default AdminMessage;