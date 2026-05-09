import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), glsl()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom", "@xstate/react", "xstate"],
					"three-vendor": [
						"three",
						"@react-three/fiber",
						"@react-three/drei",
						"@react-three/postprocessing",
					],
					"ui-vendor": [
						"@use-gesture/react",
						"gsap",
						"html2canvas",
						"react-markdown",
						"simplebar-react",
					],
				},
			},
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@import "./src/utils/respond.scss";',
			},
		},
	},
});
