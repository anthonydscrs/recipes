import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import PropTypes from 'prop-types'
import './ToastContext.css'

const ToastContext = createContext(null)

const DEFAULT_DURATION = 5000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    )
  }, [])

  const showToast = useCallback(
    (message, { type = 'error', duration = DEFAULT_DURATION } = {}) => {
      const id = nextId.current++

      setToasts((prev) => [
        ...prev,
        { id, message, type },
      ])

      if (duration) {
        setTimeout(() => dismissToast(id), duration)
      }

      return id
    },
    [dismissToast]
  )

  // Raccourci pour le cas le plus fréquent : une action qui échoue
  const showError = useCallback(
    (message) =>
      showToast(
        message || "Une erreur est survenue. Vos modifications n'ont pas été enregistrées.",
        { type: 'error' }
      ),
    [showToast]
  )

  const value = useMemo(
    () => ({ showToast, showError, dismissToast }),
    [showToast, showError, dismissToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="toast-stack"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
          >
            <span className="toast__icon" aria-hidden="true">
              {toast.type === 'error' ? '⚠️' : '✓'}
            </span>

            <p className="toast__message">
              {toast.message}
            </p>

            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fermer la notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useToast() {
  return useContext(ToastContext)
}