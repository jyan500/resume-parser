import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: "/editor",
			},
			// /editor is disallowed for general crawlers to keep it out of search
			// results, but the AdSense crawler (Mediapartners-Google) needs access
			// to scan page content there — without this it cannot serve contextual
			// ads on /editor and would fall back to untargeted/blank ads.
			{
				userAgent: "Mediapartners-Google",
				allow: "/",
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
	}
}
