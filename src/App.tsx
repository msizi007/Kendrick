import { useRef, useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Spinner from "./components/Spinner";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface Message {
  sender: "user" | "bot";
  text: string;
  duration?: string;
  tokensPerSecond?: number;
  date?: string;
  time?: string;
}

function formatTime(ns: number): string {
  const units = [
    { label: "hour", ms: 1000 * 60 * 60 },
    { label: "minute", ms: 1000 * 60 },
    { label: "second", ms: 1000 },
    { label: "millisecond", ms: 1 },
    { label: "microsecond", ms: 1 / 1000 },
    { label: "nanosecond", ms: 1 / 1_000_000 },
  ];

  const ms = ns / 1_000_000; // Convert input nanoseconds to milliseconds

  for (const unit of units) {
    const value = ms / unit.ms;
    if (value >= 1) {
      const rounded = Math.round(value);
      const label = rounded === 1 ? unit.label : `${unit.label}s`; // pluralize
      return `${rounded} ${label}`;
    }
  }

  return `${ns} nanoseconds`;
}

function App() {
  const searchRef = useRef<HTMLTextAreaElement>(null);
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
            duration: formatTime(data.total_duration),
            tokensPerSecond: Math.round(
              (data.eval_count / data.eval_duration) * Math.pow(10, 9)
            ),
            date: data.created_at.split("T")[0],
            time: data.created_at.split("T")[1].split(".")[0],
          },
        ]);
        console.log("total duration: ", data);
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
        style={{
          marginLeft: "5%",
          height: "90%",
          overflowY: "auto",
        }}
      >
        <h1>Kendrick AI</h1>

        <div
          style={{
            width: "70%",
            maxHeight: "100%",
            borderRadius: "1rem",
            padding: "1rem",
            marginBottom: "10%",
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
                  maxWidth: "70%",
                }}
              >
                <MarkdownPreview
                  source={msg.text}
                  style={{
                    paddingLeft: 16,
                    backgroundColor: "white",
                    color: "black",
                  }}
                />

                {msg.sender === "bot" && (
                  <>
                    <hr className="my-2 mb-0" />
                    <p
                      className="m-0 py-2"
                      style={{
                        paddingLeft: 16,
                        fontSize: ".9rem",
                      }}
                    >
                      <p className="fw-bold m-0 p-0">
                        Duration: {msg.duration}
                      </p>
                      <p className="fw-bold m-0 p-0">
                        {msg.tokensPerSecond} tokens/sec
                      </p>
                    </p>
                  </>
                )}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
          {loading && <Spinner />}
        </div>

        <div
          style={{
            flex: 1,
            position: "fixed",
            bottom: "1rem",
            width: "80%",
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
