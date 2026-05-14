"use client"

import { useState, useCallback, useEffect } from "react"
import {default as ReactSelect} from "react-select"
import type { OptionType } from "../../_lib/types/api"

import { useAppSelector } from "../../_lib/store"
import { getSelectStyles } from "../../_lib/getSelectStyles"

interface Props {
	id?: string
    options: Array<OptionType>
	defaultValue?: OptionType | null 
    className?: string
    clearable?: boolean
	textAlign?: "left" | "center" | "right"
	textColor?: string
	searchable?: boolean
	menuInPortal?: boolean
	onBlur?: () => void
	onSelect: (selectedOption: OptionType | null) => void
}

export const Select = ({
	id,
    options, 
    defaultValue,
    clearable,
	searchable=false,
	textColor="inherit",
	textAlign="left",
    className,
    onSelect,
	onBlur,
	menuInPortal=false,
}: Props) => {
	const [val, setVal] = useState<OptionType | null>(defaultValue ?? null)
	const { isDarkMode } = useAppSelector((state) => state.resume)

        /* 
        Reset to default value 
        to make sure internal state stays in sync 
        if the parent ever clears or changes the value externally.
    */
    useEffect(() => {
        setVal(defaultValue ?? null)
    }, [defaultValue])

	const handleChange = useCallback(
		(selectedOption: OptionType | null) => {
			setVal(selectedOption)
			onSelect(selectedOption)
		}, [onSelect]
	)

	const { classNames, styles } = getSelectStyles({
        isDarkMode,
        textColor,
        textAlign,
        className,
        hideIndicatorSeparator: true,
		menuInPortal: menuInPortal,
    })

    return (
        <ReactSelect
			{
				...(menuInPortal ? {
					menuPortalTarget: document.body,
					menuPosition: "fixed",
				} : {})
			}
			inputId={id}
            options={options}
            value={val}
			onBlur={onBlur}
            classNames={classNames}
			styles={styles}
			onChange={handleChange}
            isClearable={clearable ?? true}
			isSearchable={searchable ?? true}
            getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
        />
    )
}
