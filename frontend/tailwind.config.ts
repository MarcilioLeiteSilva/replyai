import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: { sans: ["Inter", "var(--font-inter)", "sans-serif"] },
            colors: {
                primary: { DEFAULT: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
                accent: "#06b6d4",
            },
        },
    },
    plugins: [],
};

export default config;
