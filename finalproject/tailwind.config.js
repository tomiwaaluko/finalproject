import { createConfig } from "tailwindcss";

export default createConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
});
