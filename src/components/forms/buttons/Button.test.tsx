import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Button, getVariantState } from './Button'

describe('Button (Component)', () => {
	const label = 'My Button'
	const loadingLabel = 'Loading...'

	describe('Behavior', () => {
		it("Renders a 'loading display' when its status is `pending`", () => {
			render(<Button status="pending">{label}</Button>)
			expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument()
			expect(screen.getByRole('button', { name: loadingLabel })).toBeInTheDocument()
		})

		it('Automatically disables itself when its status is `pending` or `resolved`', () => {
			/* -------------------- Disabled -------------------- */
			const { rerender } = render(<Button status="pending">{label}</Button>)
			expect(screen.getByRole('button', { name: loadingLabel })).toBeDisabled()

			rerender(<Button status="resolved">{label}</Button>)
			expect(screen.getByRole('button', { name: label })).toBeDisabled()

			/* -------------------- Enabled -------------------- */
			rerender(<Button>{label}</Button>)
			expect(screen.getByRole('button', { name: label })).not.toBeDisabled()

			rerender(<Button status="idle">{label}</Button>)
			expect(screen.getByRole('button', { name: label })).not.toBeDisabled()

			rerender(<Button status="rejected">{label}</Button>)
			expect(screen.getByRole('button', { name: label })).not.toBeDisabled()
		})
	})

	describe('API', () => {
		it('Exposes a `ref` to the underlying `button` element', () => {
			let button: HTMLButtonElement | null = null
			const ref = (reactRef: HTMLButtonElement | null) => {
				button = reactRef
			}
			render(<Button ref={ref}>{label}</Button>)
			expect(screen.getByRole('button', { name: label })).toBe(button)
		})

		it('Applies the provided `status` prop to its own `data-status` attribute (if provided)', () => {
			const status = 'idle'
			const { rerender } = render(<Button status={status}>{label}</Button>)
			expect(screen.getByRole('button', { name: label })).toHaveAttribute('data-status', status)

			rerender(<Button>{label}</Button>)
			expect(screen.getByRole('button', { name: label })).not.toHaveAttribute('data-status')
		})

		it('Passes all button-related `props` directly to the underlying `button` element', () => {
			const buttonProps = { type: 'button', name: 'my-button', value: 'my-value' } as const
			render(<Button {...buttonProps}>{label}</Button>)

			const button = screen.getByRole('button', { name: label })
			Object.entries(buttonProps).forEach(([key, value]) => expect(button).toHaveAttribute(key, value))
			expect(button).toHaveTextContent(label)
		})

		it('Prioritizes the provided `disabled` prop even if its `status` is `pending` or `resolved`', () => {
			const { rerender } = render(
				<Button status="pending" disabled={false}>
					{label}
				</Button>,
			)
			expect(screen.getByRole('button', { name: loadingLabel })).not.toBeDisabled()

			rerender(
				<Button status="resolved" disabled={false}>
					{label}
				</Button>,
			)
			expect(screen.getByRole('button', { name: label })).not.toBeDisabled()
		})
	})

	describe('getVariantState', () => {
		it('Returns correct variant values', () => {
			render(<Button status="pending">{label}</Button>)
			expect(
				getVariantState({
					secondary: true,
				}),
			).toStrictEqual('secondary')
			expect(
				getVariantState({
					tertiary: true,
				}),
			).toStrictEqual('tertiary')
			expect(
				getVariantState({
					text: true,
				}),
			).toStrictEqual('text')
			expect(
				getVariantState({
					hug: true,
				}),
			).toStrictEqual('hug')
		})
	})
})
