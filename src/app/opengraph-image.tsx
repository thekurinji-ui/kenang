import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Kenang Kurinji";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg,#FFF8F2 0%,#FFF4F4 100%)",
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            color: "#DC2626",
            letterSpacing: 4,
          }}
        >
          KENANG KURINJI
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Digital Disposable Camera
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            for Modern Events
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#4B5563",
              lineHeight: 1.5,
              maxWidth: 820,
            }}
          >
            Scan. Jepret. Kenang.
            Digital disposable camera untuk pernikahan,
            wisuda, ulang tahun, konser,
            dan berbagai momen berharga.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#6B7280",
          }}
        >
          <div style={{ display: "flex" }}>
            kenang.kurinji.asia
          </div>

          <div style={{ display: "flex" }}>
            The Kurinji
          </div>
        </div>
      </div>
    ),
    size
  );
}
