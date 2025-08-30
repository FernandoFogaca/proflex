import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'
import { AppProvider } from '../context/AppContext.jsx'
import { describe, it, test, expect } from 'vitest'

test('Header mostra link Home', () => {
  render(
    <AppProvider>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AppProvider>
  )
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
})
