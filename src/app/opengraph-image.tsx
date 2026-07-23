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
          padding: "72px",
          background: "#F8F5F1",
          color: "#1A1A1A",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#D64545",
            fontWeight: 700,
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
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Disposable Camera
            <br />
            for Modern Events.
          </div>

          <div
            style={{
              fontSize: 28,
              color: "#666",
              lineHeight: 1.5,
            }}
          >
            Scan. Shoot. Remember.
            <br />
            Digital disposable camera untuk pernikahan,
            wisuda, ulang tahun, dan berbagai momen berharga.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#888",
          }}
        >
          <span>kenang.kurinji.asia</span>
          <span>The Kurinji</span>
        </div>
      </div>
    ),
    size
  );
}
