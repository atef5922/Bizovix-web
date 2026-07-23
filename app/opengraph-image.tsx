import { ImageResponse } from "next/og";

export const alt = "Bizovix cloud ERP platform preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #f7fbff 0%, #ffffff 48%, #dff4ff 100%)",
          color: "#071a33",
          fontFamily: "Arial, sans-serif",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "56%" }}>
          <div style={{ color: "#126cff", fontSize: 30, fontWeight: 800 }}>Bizovix</div>
          <div style={{ fontSize: 72, lineHeight: 0.96, fontWeight: 900, marginTop: 20 }}>
            One Connected ERP to Run Every Part of Your Business
          </div>
          <div style={{ color: "#617089", fontSize: 28, lineHeight: 1.35, marginTop: 26 }}>
            Accounting, Inventory, Manufacturing, Sales, and People Connected.
          </div>
        </div>
        <div style={{ marginLeft: 58, flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", borderRadius: 34, background: "#ffffff", boxShadow: "0 28px 80px rgba(7,26,51,.18)", padding: 28 }}>
            {["Revenue BDT 18.4M", "Production 71%", "Low stock 14", "Approvals 24"].map((item) => (
              <div key={item} style={{ display: "flex", justifyContent: "space-between", borderRadius: 18, background: "#f0f6ff", padding: 20, marginBottom: 16, color: "#071a33", fontSize: 24, fontWeight: 800 }}>
                <span>{item}</span><span style={{ color: "#126cff" }}>Live</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
