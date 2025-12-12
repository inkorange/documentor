'use client'

/* ------------------ Component Styling Dependencies --------------------------- */
import styles from './Button.module.scss'

import React, { useMemo } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text' | 'hug'
export interface ButtonVariantProps {
	/**
	 * Defines the variant of the button, by default the button variant would be primitive, but the explicit prop variant types (`secondary`,`tertiary`,`tertiary`,`text`) would override this.
	 * @renderVariants true
	 * @displayTemplate {variant} Button
	 */
	variant?: ButtonVariant
	/** Secondary button variation. Used for other primary actions in app that are not transactional */
	secondary?: boolean
	/** Tertiary button variation. Used for secondary actions on screens, typically on its own.  */
	tertiary?: boolean
	/** Text button variation. Rendered without an outline, looks more like a link */
	text?: boolean
	/** Hug button variation */
	hug?: boolean
	/** Square button variant (rounded is default) */
	square?: boolean
	/** Custom styling class */
	className?: string
}
export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'>, ButtonVariantProps {
	/** The current loading status of the action that this button initiated. A status of `pending` or `resolved` automatically `disables` the button (overridable) */
	status?: string
	/** Button type prop that semantically describes the purpose of the button, defaulting to "button" */
	type?: Exclude<React.ComponentPropsWithoutRef<'button'>['type'], undefined>
	/** Implementing custom class on the root button element, but should avoid passing in the legacy btn-* class names */
	className?: string
	/* @example Button Text */
	children: React.ReactNode;
}

export const getVariantState = ({
	secondary,
	tertiary,
	text,
	hug,
	variant = 'primary',
}: ButtonVariantProps): ButtonVariant => {
	if (secondary) return 'secondary'
	if (tertiary) return 'tertiary'
	if (text) return 'text'
	if (hug) return 'hug'
	return variant
}

/**
 * A design-system enforced button component that enforces the various states of the button.
 * 1. primary | secondary | tertiary | text | hug variants passed directly as props:
 * 2. Pending/Resolved states that will render loading icons.
 * 3. Native button element type handling button | submit | reset
 *
 * ```JSX
 * 	<Button>Click Me</Button> // will default to button type, primary viariant
 * 	<Button secondary>Click Me</Button> // shorthand variant prop notation
 * ```
 *
 * **Localization Considerations:**
 *
 * This component requires localized text for the "loading" pending state. This label will not be presented to the user
 * within the view and are primarily considered for accessibility.
 *
 * This is configured via the `labelConfig` prop in `UAComponentsProvider` under the following object:
 * ```typescript
 * Button: {
 *     loading: 'Loading...',
 * }
 * ```
 */
const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		status,
		type = 'button',
		variant = 'primary',
		secondary,
		tertiary,
		text,
		hug,
		square,
		children,
		className = '',
		...attrs
	}: ButtonProps,
	ref,
) {
	const disabledStatus = ['pending', 'resolved']

	const variantState: ButtonVariant = useMemo(
		() =>
			getVariantState({
				variant,
				secondary,
				tertiary,
				text,
				hug,
				square,
			}),
		[hug, secondary, tertiary, text, variant, square],
	)

	const renderChildren = useMemo(() => {
		const LoadingButtonContent = () => (
			<>
				Loading...
				<span className="visually-hidden">Loading...</span>
			</>
		)
		if (status === 'pending') return <LoadingButtonContent />
		return (
			<>
				{children}
				{status === 'resolved' && '✅'}
			</>
		)
	}, [status, children])
	/* eslint-disable react/button-has-type */

	return (
		<button
			className={`${styles.btn} ${styles[`btn__${variantState}`]} ${
				square ? styles.btn__square : ''
			} ${className.trim()}`}
			ref={ref}
			type={type}
			disabled={disabledStatus.includes(status ?? '')}
			{...attrs}
			data-variant={variantState}
			data-status={status}
		>
			{renderChildren}
		</button>
	)
	/* eslint-disable react/button-has-type */
})

ButtonBase.displayName = 'Button'

const MemoizedButton = React.memo(ButtonBase)
MemoizedButton.displayName = 'Button'

export const Button = MemoizedButton
