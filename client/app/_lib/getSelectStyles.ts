import type { StylesConfig, ClassNamesConfig, GroupBase } from 'react-select'
import type { OptionType } from "./types/api"
import { SELECT_Z_INDEX } from './constants'

interface GetSelectStylesParams {
	isDarkMode: boolean
	textColor?: string
	textAlign?: string
	className?: string
	hideIndicatorSeparator?: boolean
	menuInPortal?: boolean
	isError?: boolean
}

export const getSelectStyles = ({
	isDarkMode,
	textColor = 'inherit',
	textAlign = 'left',
	className = 'w-full',
	hideIndicatorSeparator = false,
	menuInPortal = false,
	isError = false,
}: GetSelectStylesParams): {
	classNames: ClassNamesConfig<OptionType, false, GroupBase<OptionType>>
	styles: StylesConfig<OptionType, false, GroupBase<OptionType>>
} => {

	/* TODO: Dark Mode Styling is commented out right now, but if other form inputs get dark styling, this can be uncommented*/
	return {
		classNames: {
			control: (_state) => `${className} ${SELECT_Z_INDEX} dark:!tw-bg-gray-800 dark:!tw-border-gray-600`,
			menu: (_base) => `dark:!tw-bg-gray-800`,
			placeholder: (_base) => `dark:!tw-text-gray-200`,
		},
		styles: {
			menuPortal: base => ({ ...base, zIndex: menuInPortal ? 9999 : 50 }),
			control: (baseStyles, state) => ({
				...baseStyles,
				height: "43px",
				padding: ".1em",
				textAlign: textAlign as any,
				borderColor: isError
					? '#f87171'
					: state.isFocused
						? '#16a34a'
						: baseStyles.borderColor,
				boxShadow: isError
					? '0 0 0 1px #f87171'
					: state.isFocused
						? '0 0 0 1px #16a34a'
						: baseStyles.boxShadow,
				'&:hover': {
					borderColor: isError ? '#f87171' : '#16a34a',
				},
			}),
			option: (provided, state) => ({
				...provided,
				color: isDarkMode
					? (state.isFocused ? '#f9fafb' : '#e5e7eb')
					: (state.isFocused ? '#111827' : '#374151'),
				backgroundColor: isDarkMode
					? (state.isFocused ? '#374151' : '#1f2937')
					: (state.isFocused ? '#f3f4f6' : 'white'),
				cursor: 'pointer',
			}),
			singleValue: (base) => ({
				...base,
				color: textColor === "inherit" ? isDarkMode ? "white" : "black" : textColor,
			}),
			placeholder: (base) => ({
				...base,
				color: textColor === "inherit" ? (isDarkMode ? "white": "black") : textColor,
				textAlign: textAlign as any,
			}),
			dropdownIndicator: (provided, state) => {
				const defaultFill = textColor === "inherit" ? (isDarkMode ? "white" : "black") : textColor;
				return {
					...provided,
					'svg': {
						fill: state.isFocused ? '#16a34a' : defaultFill,
					},
					'&:hover svg': {
						fill: '#16a34a',
					},
				};
			},
			valueContainer: (provided) => ({
				...provided,
				textAlign: textAlign as any,
			}),
			indicatorSeparator: () => ({
				display: hideIndicatorSeparator ? 'none' : 'block',
				'svg': {
					fill: textColor === "inherit" ? (isDarkMode ? "white": "black") : textColor
				}
			}),
		},
	}
}
