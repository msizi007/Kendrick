import { useRef, useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Spinner from "./components/Spinner";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface Message {
  sender: "user" | "bot";
  text: string;
}

function App() {
  const searchRef = useRef<HTMLTextAreaElement>(null);
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Auto scroll to bottom on new message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function cleanResponse(text: string) {
    return text.replace("**", "\n").trim();
  }

  const getResponse = () => {
    const prompt = searchRef.current?.value?.trim();
    if (!prompt) return;

    // Set loading to true
    setLoading(true);

    // Add user message
    setChat((prev) => [...prev, { sender: "user", text: prompt }]);
    searchRef.current!.value = "";

    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:270m",
        prompt: prompt,
        stream: false,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChat((prev) => [
          ...prev,
          {
            sender: "bot",
            text: cleanResponse(data.response) || "No response.",
          },
        ]);
      })
      .catch((err) => {
        console.error("Error:", err);
        setChat((prev) => [
          ...prev,
          { sender: "bot", text: "Something went wrong." },
        ]);
      })
      .finally(() => {
        setLoading(false); // Spinner stops here
      });
  };

  return (
    <>
      <Sidebar />
      <div
        className="w-100 d-flex flex-column justify-content-center align-items-center"
        style={{ marginLeft: "5%", height: "100vh", overflowY: "auto" }}
      >
        <h1>Kendrick AI</h1>

        <div
          style={{
            width: "70%",
            maxHeight: "70vh",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "1rem",
            padding: "1rem",
            background: "#f8f9fa",
            marginBottom: "1rem",
          }}
        >
          {chat.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === "user" ? "right" : "left",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1rem",
                  borderRadius: "1rem",
                  background: msg.sender === "user" ? "#007bff" : "#e9ecef",
                  color: msg.sender === "user" ? "#fff" : "#000",
                  maxWidth: "70%",
                }}
              >
                <MarkdownPreview source={msg.text} style={{ padding: 16 }} />
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
          {loading && <Spinner />}
        </div>

        <div
          style={{
            position: "relative",
            width: "70%",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <textarea
            className="form-control"
            style={{
              resize: "none",
              fontSize: "1rem",
              padding: "0.5rem",
              flex: 1,
              borderRadius: "0.5rem",
            }}
            ref={searchRef}
            rows={2}
            placeholder="Type your message..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                getResponse();
              }
            }}
          />
          <button className="btn btn-primary" onClick={getResponse}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
