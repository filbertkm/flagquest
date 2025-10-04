// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/image"],
  devtools: { enabled: true },
  compatibilityDate: "2025-07-15",
  app: {
    baseURL: "/wikidata-game/",
  },
  eslint: {
    config: {
      stylistic: {
        semi: true,
        quotes: "double",
        commaDangle: "always-multiline",
        indent: "tab",
      },
    },
  },
});
