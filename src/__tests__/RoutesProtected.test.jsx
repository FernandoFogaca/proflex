import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../authentication/ProtectedRoute'
import Agenda from '../pages/Agenda'
import Login from '../pages/Login'
import { AppProvider } from '../context/AppContext.jsx'
import { describe, it, test, expect, beforeEach } from 'vitest'

beforeEach(() => {
  localStorage.removeItem('pf_logged')
})

test('rota /agenda exige login e manda pro /login', () => {
  render(
    <AppProvider>
      <MemoryRouter initialEntries={['/agenda']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Agenda />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
  expect(screen.getByText(/entrar/i)).toBeInTheDocument()
})
