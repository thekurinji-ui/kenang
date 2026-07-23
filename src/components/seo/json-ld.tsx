export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "The Kurinji",
        url: "https://kurinji.asia",
        logo: "https://kenang.kurinji.asia/logo.png",
      },
      {
        "@type": "SoftwareApplication",
        name: "Kenang Kurinji",
        applicationCategory: "PhotographyApplication",
        operatingSystem: "Web",
        url: "https://kenang.kurinji.asia",
        description:
          "Digital disposable camera untuk pernikahan, wisuda, ulang tahun, konser, dan berbagai acara.",
        publisher: {
          "@type": "Organization",
          name: "The Kurinji",
        },
      },
      {
        "@type": "WebSite",
        name: "Kenang Kurinji",
        url: "https://kenang.kurinji.asia",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
