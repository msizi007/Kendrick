import React, { useEffect, useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview"; // or your markdown component

interface Props {
  text: string;
}

const TypingMarkdown = ({ text }: Props) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length - 1) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      }

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 100); // 500ms = 0.5s per character

    return () => clearInterval(interval); // cleanup
  }, [text]);

  return (
    <div style={{ padding: 16 }}>
      <MarkdownPreview source={displayedText} />
    </div>
  );
};

export default TypingMarkdown;
