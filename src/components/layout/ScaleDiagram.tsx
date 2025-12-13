/* ------------------ Component Styling Dependencies --------------------------- */
import styles from './ScaleDiagram.module.scss'

import React from 'react'

interface ScaleDiagramProps {
	/**
	 * needs a descripton?
	 * @hideInDocs
	 */
	className?: string
	/** Collection of keys used for each scale option */
	options: string[]
	/** The _index_ of the selected `option` */
	selectedOption: number
	/** Sets the variant to be a small circle indicator */
	small?: boolean
	children?: Array<React.ReactElement<ScaleItemProps>>
}

/** Presents a list of (unalterable) options on an evenly-distributed scale */
export const ScaleDiagram = ({
	className = '',
	options,
	selectedOption,
	small = false,
	children,
}: ScaleDiagramProps): React.ReactElement => {
	const circleWidth = small ? 8 : 16
	const verticalLineHeight = small ? 8 : 16

	const radius = circleWidth / 2
	const innerCircleRadius = small ? radius : circleWidth / 4 + 1.25

	const scaleIndicatorOptions = {
		r: innerCircleRadius,
		stroke: small ? undefined : 'white',
		strokeWidth: small ? undefined : '2.5',
	}

	return (
		<div className={`${styles.scale} ${className}`}>
			<ul className={styles.scale__illustration} aria-hidden="true" data-testid="diagram-options">
				{options.map((option, i) => {
					return (
						<li key={String(option)}>
							{i === selectedOption ? (
								<svg viewBox={`0 0 ${circleWidth} ${circleWidth}`} width={circleWidth} height={circleWidth}>
									{!small && <circle r="calc(100% / 2)" cx="50%" cy="50%" />}
									<circle cx="50%" cy="50%" {...scaleIndicatorOptions} />
								</svg>
							) : (
								!small && (
									<svg viewBox={`0 0 1 ${verticalLineHeight}`} width="1px" height={`${verticalLineHeight}px`}>
										<line x1="50%" y1="0" x2="50%" y2="100%" stroke="black" />
									</svg>
								)
							)}
						</li>
					)
				})}
			</ul>

			<ul className={styles.scale__descriptions} role="none">
				{children &&
					React.Children.map(children, (child, i) => (
						<li data-option-text data-selected={i === selectedOption} aria-hidden={i !== selectedOption}>
							{child}
						</li>
					))}
			</ul>
		</div>
	)
}

interface ScaleItemProps {
	label: string
	description: string
}
export const ScaleItem = ({ label, description }: ScaleItemProps) => {
	return (
		<>
			<div aria-hidden>{label}</div>
			<div aria-hidden>{description}</div>
		</>
	)
}
