export default function LogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const options = [
    "New moves I learned",
    "Combo I learned",
    "Notes on a move",
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "320px",
          maxWidth: "90vw",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <h2 style={{ margin: "0 0 20px 0" }}>Log</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {options.map((label) => (
            <button
              key={label}
              onClick={() => console.log(label)}
              style={{
                padding: "16px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                background: "white",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
