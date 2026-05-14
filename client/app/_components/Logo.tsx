interface Props {
	isFooter?: boolean
}

export const Logo = ({ isFooter = false }: Props) => {
	return (
		<>
			<img src="/logo-draftwise.svg" alt="CVSquared" className="h-7 w-auto" />
			<p
				className={`${isFooter ? "text-white" : "text-brand-dark"} font-semibold`}
				style={{ fontSize: "15.6px", lineHeight: "1.4" }}
			>
				CVSquared
			</p>
		</>
	)
}

