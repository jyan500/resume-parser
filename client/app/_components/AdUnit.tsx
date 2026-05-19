"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"
import { ADSENSE_CLIENT } from "../_lib/constants"

type AdUnitProps = {
	adSlot: string
	adFormat?: string
	adLayout?: string
	className?: string
}

export function AdUnit({ adSlot, adFormat = "auto", adLayout, className }: AdUnitProps) {
	// Guards against React Strict Mode double-invoking this effect in dev, which
	// would push() twice for one <ins> and trigger "already have ads in them".
	const pushed = useRef(false)

	useEffect(() => {
		if (pushed.current) return
		pushed.current = true
		try {
			;(window.adsbygoogle = window.adsbygoogle || []).push({})
		} catch {}
	}, [])

	return (
		<>
			<Script
				id="adsbygoogle-loader"
				async
				src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
				crossOrigin="anonymous"
				strategy="afterInteractive"
			/>
			<ins
				className={`adsbygoogle ${className ?? ""}`}
				style={{ display: "block" }}
				data-ad-client={ADSENSE_CLIENT}
				data-ad-slot={adSlot}
				data-ad-format={adFormat}
				{...(adLayout ? { "data-ad-layout": adLayout } : {})}
				data-full-width-responsive="true"
			/>
		</>
	)
}
