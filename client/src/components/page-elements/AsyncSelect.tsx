import React, { useState, useEffect, useCallback } from "react"
import { AsyncPaginate } from 'react-select-async-paginate';
import { useLazyGenericFetchQuery } from "../../api/public/generic"
import type { ListResponse, OptionType } from "../../types/api"
import type { OptionsOrGroups, GroupBase, SelectInstance } from "react-select"
import { useAppSelector } from "../../store"
import { getSelectStyles } from "../../helpers/getSelectStyles";

export interface LoadOptionsType {
	options: ListResponse<any>
	hasMore: boolean
	additional: {
		page: number
	}
}

interface AsyncSelectProps {
	id?: string
	endpoint: string
	defaultValue?: OptionType | null 
	clearable?: boolean
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
	className?: string 
	urlParams: Record<string, any>
	cacheKey?: string
	menuInPortal?: boolean
	isError?: boolean
	onSelect: (selectedOption: OptionType | null) => void
}


export const AsyncSelect = React.forwardRef<SelectInstance<OptionType, false, GroupBase<OptionType>>, AsyncSelectProps>((
	{ 
		id, 
		cacheKey, 
		clearable=false, 
		className, 
		defaultValue, 
		endpoint, 
		onSelect, 
		urlParams, 
		onBlur,
		isError=false,
		menuInPortal=false
	}, ref) => {
	const [, setSearchTerm] = useState("")
	const [val, setVal] = useState<OptionType | null>(defaultValue ?? null)
	const [ genericFetch ] = useLazyGenericFetchQuery()
	const { isDarkMode } = useAppSelector((state) => state.resume)

    /* 
        Reset to default value 
        to make sure internal state stays in sync 
        if the parent ever clears or changes the value externally.
    */
    useEffect(() => {
        setVal(defaultValue ?? null)
    }, [defaultValue])

	const loadOptions = async (
		query: string,
		_loadedOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>,
		additional: {page: number} | undefined) => {
		try {
			const {items, hasNext} = await genericFetch({
				endpoint,
				urlParams: {...urlParams, query: query, page: additional?.page ? additional.page : 1},
			}).unwrap()

			if (!items.length) {
				return {
					options: [],
					hasMore: false,
					additional: {page: 1}
				}
			}
			const options = [...items]
			const next = {
				options,
				hasMore: Boolean(hasNext),
				...(additional ? {additional: {page: additional?.page ? additional?.page + 1 : 1}} : {})
			}
			return next
		}
		catch (e){
			return {
				options: [],
				hasMore: false,
				additional: {page: 1}
			}	
		}
	}

	const handleInputChange = (newValue: string) => {
		const inputValue = newValue.trim()
		setSearchTerm(inputValue)
		return inputValue
	}

	const handleChange = useCallback(
		(selectedOption: OptionType | null) => {
			setVal(selectedOption)
			onSelect(selectedOption)
		}, [onSelect]
	)

	const { classNames, styles } = getSelectStyles({
        isDarkMode,
        className: className,
        hideIndicatorSeparator: false,
		menuInPortal: menuInPortal,
		isError: isError, 
    })

	return (
		<AsyncPaginate
			{
				...(menuInPortal ? {
					menuPortalTarget: document.body,
					menuPosition: "fixed",
				} : {})
			}
			inputId={id}
			selectRef={ref}
			loadOptions={loadOptions}
			value={val}
			onInputChange={handleInputChange}
			onBlur={onBlur}
			additional={{page: 1}}
			classNames={classNames}
			styles={styles}
			onChange={handleChange}
			getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
			placeholder="Search"
			// wait milliseconds amount after user stops typing before searching
			debounceTimeout={300}
			isClearable={clearable}
			cacheUniqs={[cacheKey ?? ""]}
			menuShouldScrollIntoView={false}
		/>
	)
})
