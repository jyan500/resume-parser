import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	return [
		{
			url: BASE_URL,
			lastModified,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/privacy-policy`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: `${BASE_URL}/terms-of-service`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: `${BASE_URL}/contact-us`,
			lastModified,
			changeFrequency: "yearly",
			priority: 0.5,
		},
	]
}
