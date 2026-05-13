interface Props {
	size?: string
}

export const LoadingSpinner = ({ size = "w-4 h-4" }: Props) => {
	return <div className={`${size} rounded-full border-2 border-brand-border border-t-brand-accent animate-spin`}></div>
}
