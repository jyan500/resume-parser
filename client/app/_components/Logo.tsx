interface Props {
	isFooter?: boolean
}

export const Logo = ({ isFooter = false }: Props) => {
	return (
		<>
			<img src="/logo-cvsquared.png" alt="CVSquared" className="h-7 w-auto" />
			<p
				className={`mt-1 ${isFooter ? "text-white" : "text-brand-dark"} font-semibold`}
				style={{ fontSize: "15.6px", lineHeight: "1.4" }}
			>
				CVSquared
			</p>
		</>
	)
}

