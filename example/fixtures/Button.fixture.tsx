// Example React component
function Button({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        backgroundColor: "#0070f3",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {label}
    </button>
  );
}

// Cosmos fixtures
export default {
  'Primary Button': <Button label="Click me!" />,
  'Secondary Button': <Button label="Cancel" />,
  'Disabled State': (
    <Button label="Disabled" onClick={() => alert("Should not fire!")} />
  ),
}