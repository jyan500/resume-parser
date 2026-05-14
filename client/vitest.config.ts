import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./app/setupTests.ts'],
		globals: true,
		// Vitest doesn't pick up Next's .env files, so inject the env vars
		// that baseQuery / urls.ts read at module-load time. Tests don't
		// hit the network so the URL just needs to be a parseable string.
		env: {
			NEXT_PUBLIC_API_URL: 'http://localhost:5000',
		},
	},
})
