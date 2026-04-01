export interface CustomError {
	errors: Array<string>
	status: string
}

export interface ListResponse<T> {
	items: Array<T>
	hasNext: boolean
	hasPrev: boolean
	pages: number
	total: number
	/** Next page index when hasNext; otherwise null. */
	nextNum: number | null
}

export interface OptionType {
	label: string
	value: string
}

export interface ObjectType {
	id: number
	name: string
}

export type GenericType = ObjectType & {
	[key:string]: any
}
