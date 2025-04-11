// https://nuxt.com/docs/api/configuration/nuxt-config

const sw = process.env.SW === "true";

const title = "5on5.fr | La Référence Counter-Strike Française";
const description = 
  "Plateforme publique CS2 - Accès actuellement sur invitation uniquement";

// TODO - i tired to get SSO to work but it wont
const url = `https://ops.5on5.fr`;

export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      meta: [
        { name: "robots", content: "index, follow" },
        { name: "title", content: title },
        { name: "description", content: description },
        { name: "site_name", content: "#5on5.fr" },

        { property: "og:locale", content: "en" },
        { property: "og:type", content: "website" },

        { property: "og:title", content: title },
        { property: "og:site_name", content: "#5on5.fr" },

        { property: "og:url", content: url },
        { property: "og:image", content: `${url}/_ipx/_/favicon/512.png` },
      ],
      bodyAttrs: {
        class: "pre-loader",
      },
      style: [
        {
          innerHTML: `
            .pre-loader::before {
              content: '';
              position: absolute;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
            }
            .pre-loader {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              transition: opacity 0.3s;
            }
            .pre-loader--fade {
              opacity: 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `,
        },
      ],
    },
  },

  i18n: {
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      fallbackLocale: "en",
    },
    locales: [
      { code: "en", name: "English", file: "en.json", flag: "🇬🇧" },
      { code: "sv", name: "Svenska", file: "sv.json", flag: "🇸🇪" }, // Swedish
      { code: "ua", name: "Українська", file: "ua.json", flag: "🇺🇦" }, // Ukrainian
      { code: "ko", name: "한국어", file: "ko.json", flag: "🇰🇷" }, // Korean
      { code: "ja", name: "日本語", file: "ja.json", flag: "🇯🇵" }, // Japanese
      { code: "de", name: "Deutsch", file: "de.json", flag: "🇩🇪" }, // German
      { code: "fr", name: "Français", file: "fr.json", flag: "🇫🇷" }, // French
      { code: "it", name: "Italiano", file: "it.json", flag: "🇮🇹" }, // Italian
      { code: "es", name: "Español", file: "es.json", flag: "🇪🇸" }, // Spanish
      { code: "da", name: "Dansk", file: "da.json", flag: "🇩🇰" }, // Danish
      { code: "pl", name: "Polski", file: "pl.json", flag: "🇵🇱" }, // Polish
      { code: "ru", name: "Русский", file: "ru.json", flag: "🇷🇺" }, // Russian
      { code: "lv", name: "Latviešu", file: "lv.json", flag: "🇱🇻" }, // Latvian
      {
        code: "pt-BR",
        name: "Português Brasileiro",
        file: "pt-BR.json",
        flag: "🇧🇷",
      },
      { code: "zh", name: "中文", file: "zh.json", flag: "🇨🇳" },
    ],
    lazy: true,
    defaultLocale: "en",
  },

  runtimeConfig: {
    public: {
      apiDomain: "",
      wsDomain: "",
      webDomain: "",
      demosDomain: "",
    },
  },

  modules: [
    "@nuxtjs/apollo",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@nuxt/image",
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
  ],

  pwa: {
    injectRegister: "auto",
    registerType: "autoUpdate",
    client: {
      installPrompt: true,
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff}"],
    },
    includeAssets: [
      "img/**/*.png",
      "img/**/*.svg",
      "img/**/*.webp",
      "fonts/*.woff",
      "favicon/*.png",
    ],
    devOptions: {
      enabled: true,
    },
    manifest: {
      name: "#5on5.fr",
      short_name: "#5on5.fr",
      icons: [
        {
          src: "/favicon/64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "/favicon/192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/favicon/512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
      theme_color: "#000000",
      background_color: "#000000",
      display: "standalone",
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "dark",
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  // disable auto imports for components
  components: {
    dirs: [],
  },

  css: ["~/assets/css/tailwind.css"],

  postcss: {
    plugins: {
      "tailwindcss/nesting": "postcss-nesting",
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },

  apollo: {
    proxyCookies: true,
    clients: {
      default: {
        httpEndpoint: `https://temp/v1/graphql`,
      },
    },
  },

  compatibilityDate: "2024-07-15",
});
