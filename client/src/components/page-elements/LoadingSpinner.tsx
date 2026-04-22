interface Props {
    size?: string
}

export const LoadingSpinner = ({size="w-4 h-4"}: Props) => {
    return <div className={`${size} rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin`} />
}
