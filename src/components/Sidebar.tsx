import Logo from "./Logo";

export default function Sidebar() {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "5%",
        height: "100%",
        backgroundColor: "#f0f0f0",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <Logo size={50} />
      <button
        style={{
          fontSize: "2.5rem",
          border: "none",
          borderRadius: "3rem",
        }}
      >
        +
      </button>
    </div>
  );
}
