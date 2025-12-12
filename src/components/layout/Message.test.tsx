import { render, screen } from '@testing-library/react'
import { Message } from './Message'

describe('Message', () => {
	it('renders default display settings', () => {
		render(<Message>Simple Message</Message>)
		expect(screen.getByRole('alert')).toBeInTheDocument()
		expect(screen.getByRole('alert')).toHaveTextContent('Simple Message')
	})

	it('renders error variant correctly', () => {
		render(<Message type="error">Simple Message</Message>)
		expect(screen.getByRole('alert')).toBeInTheDocument()
	})
})
