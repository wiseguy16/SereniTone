import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function getBasePath() {
  if (!process.env.GITHUB_ACTIONS) {
    return "/";
  }

  const repoSlug = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

  if (!repoSlug || repoSlug.endsWith(".github.io")) {
    return "/";
  }

  return `/${repoSlug}/`;
}

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
});
