'use client'

/* ------------------ Component Styling Dependencies --------------------------- */
import styles from './Message.module.scss'

import React, { forwardRef } from 'react'

type MessageType = 'alert' | 'error' | 'warning' | 'text'
interface MessageProps {
	/**
	 * @hideInDocs
	 */
	className?: string
	/**
	 * Defines the type of the message component and drives the look and feel with logic to conditionally show the icon on the left based on the message type.
	 * @renderVariants true
	 * @displayTemplate {type} Message
	 */
	type?: MessageType
	id?: string
	children: NonNullable<React.ReactNode>
}

/**
 * The `Message` component enforces the look and feel of all `error`, `alert`, `text`, and `warning` messaging styles.
 * Using the `error` type will present the message in an error state with the colors defined by the design system.
 * To be backwards compatible with the now removed `ErrorMessage` and `CalloutMessage` components, there are several
 * props that drive specific look and feel where the designs call for it.
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(
	{ children, type = 'alert', className = '', ...attrs },
	ref,
) {

	return (
		<div className={`${styles.msg} ${styles[`msg--${type}`]} ${className}`} role="alert" {...attrs} ref={ref}>
			<div>{children}</div>
		</div>
	)
})
