import { ImageResponse } from "next/og";

export const alt = "Figma to Code — private, free and open source";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 76px",
        background: "#f6faf5",
        color: "#07160d",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#07160d",
            color: "#63e58e",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          &lt;/&gt;
        </div>
        <span style={{ fontSize: 28, fontWeight: 700 }}>Figma to Code</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            maxWidth: 980,
            fontSize: 72,
            lineHeight: 0.98,
            letterSpacing: -4,
            fontWeight: 700,
          }}
        >
          Figma to code, without sending your designs anywhere.
        </div>
        <div
          style={{ display: "flex", gap: 14, fontSize: 24, color: "#516158" }}
        >
          <span>Free</span>
          <span>·</span>
          <span>Private</span>
          <span>·</span>
          <span>Open source</span>
          <span>·</span>
          <span>No AI required</span>
        </div>
      </div>
    </div>,
    size,
  );
}
