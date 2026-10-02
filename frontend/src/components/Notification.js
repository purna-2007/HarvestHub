import React from "react";

function Notification({ title, message, phone, children }) {
  return (
    <article
      role="status"
      style={{
        border: "1px solid #d1d5db",
        borderLeft: "4px solid #2563eb",
        borderRadius: 8,
        background: "#ffffff",
        padding: 14,
        margin: "10px 0"
      }}
    >
      {title && <h3 style={{ margin: "0 0 8px" }}>{title}</h3>}
      {message && <p style={{ margin: 0 }}>{message}</p>}
      {children}
      {phone && (
        <a href={`tel:${phone}`} style={{ display: "inline-block", marginTop: 8 }}>
          {phone}
        </a>
      )}
    </article>
  );
}

export default Notification;