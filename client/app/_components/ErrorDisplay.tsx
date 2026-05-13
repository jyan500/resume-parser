"use client"

import type { SerializedError } from "@reduxjs/toolkit"
import type { CustomError } from "../_lib/types/api"

interface Props {
	error: SerializedError | CustomError | null | undefined
}

export const ErrorDisplay = ({ error }: Props) => {
	return (
		<div className="flex flex-col gap-y-2">
			{(error as CustomError)?.errors?.map((error, index) => (
				<p key={`error_${index}`} className="text-xs text-red-600 leading-relaxed">{error}</p>
			))}
		</div>
	)
}
