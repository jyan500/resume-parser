import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	turbopack: {
		root: __dirname,
	},
	// @react-pdf/renderer ships its own bundled react-reconciler. Without
	// transpiling, Turbopack treats the bundle as opaque and the reconciler
	// fails to link to React at runtime ("Cannot read properties of undefined
	// (reading 'hasOwnProperty')"). Forcing it through the same transform as
	// our own source fixes the reconciler↔React wiring.
	transpilePackages: ["@react-pdf/renderer"],
}

export default nextConfig
