import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts_tmp/AuthContext'
import { useToast } from '../contexts_tmp/ToastContext'
import './CommentSection.css'

const MAX_LENGTH = 1000

function formatDate(iso) {
  const date = new Date(iso)

  const day = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${day} à ${time}`
}

function CommentSection({ recipeId }) {
  const { user } = useAuth()
  const { showError } = useToast()

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const confirmTimeoutRef = useRef(null)

  const token = localStorage.getItem('token')
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  }

  /*
   * ============================================
   * CHARGEMENT
   * ============================================
   */

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/comments/${recipeId}`,
      { headers: authHeaders }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            'Erreur lors du chargement des commentaires'
          )
        }
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setComments(data)
        }
      })
      .catch((err) => {
        console.error(
          'Erreur chargement commentaires :',
          err
        )
        if (!cancelled) {
          showError(
            'Impossible de charger les commentaires.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

  useEffect(() => {
    return () => clearTimeout(confirmTimeoutRef.current)
  }, [])

  /*
   * ============================================
   * AJOUT
   * ============================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmed = content.trim()

    if (!trimmed) {
      return
    }

    setPosting(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/comments/${recipeId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({ content: trimmed }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))

        throw new Error(
          body.error ||
            "Erreur lors de l'ajout du commentaire"
        )
      }

      const saved = await res.json()

      setComments((prev) => [...prev, saved])
      setContent('')
    } catch (err) {
      console.error('Erreur ajout commentaire :', err)
      showError(
        err.message ||
          "Le commentaire n'a pas pu être publié."
      )
    } finally {
      setPosting(false)
    }
  }

  /*
   * ============================================
   * SUPPRESSION (confirmation en 2 clics)
   * ============================================
   */

  const handleDeleteClick = (commentId) => {
    if (confirmingId !== commentId) {
      setConfirmingId(commentId)

      clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmingId(null)
      }, 3000)

      return
    }

    clearTimeout(confirmTimeoutRef.current)
    setConfirmingId(null)
    handleDelete(commentId)
  }

  const handleDelete = async (commentId) => {
    setDeletingId(commentId)

    const previousComments = comments
    setComments((prev) =>
      prev.filter((comment) => comment.id !== commentId)
    )

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: authHeaders,
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))

        throw new Error(
          body.error ||
            'Erreur lors de la suppression du commentaire'
        )
      }
    } catch (err) {
      console.error(
        'Erreur suppression commentaire :',
        err
      )
      showError(
        "Le commentaire n'a pas pu être supprimé."
      )
      setComments(previousComments)
    } finally {
      setDeletingId(null)
    }
  }

  /*
   * ============================================
   * RENDU
   * ============================================
   */

  return (
    <section className="comment-section">
      <h2 className="comment-section__title">
        COMMENTAIRES ({comments.length})
      </h2>

      <form
        className="comment-section__form"
        onSubmit={handleSubmit}
      >
        <textarea
          className="comment-section__textarea"
          placeholder="Laisser un commentaire sur cette recette…"
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          maxLength={MAX_LENGTH}
          rows={3}
        />

        <button
          type="submit"
          className="comment-section__submit"
          disabled={posting || !content.trim()}
        >
          {posting ? 'Publication…' : 'Publier'}
        </button>
      </form>

      <div className="comment-section__list">
        {loading && (
          <p className="comment-section__empty">
            Chargement des commentaires…
          </p>
        )}

        {!loading && comments.length === 0 && (
          <p className="comment-section__empty">
            Aucun commentaire pour l'instant. Soyez le
            premier à en laisser un !
          </p>
        )}

        {!loading &&
          comments.map((comment) => (
            <div
              className="comment-section__item"
              key={comment.id}
            >
              <div className="comment-section__item-header">
                <span className="comment-section__author">
                  {comment.pseudo}
                </span>

                <span className="comment-section__date">
                  {formatDate(comment.created_at)}
                </span>
              </div>

              <p className="comment-section__content">
                {comment.content}
              </p>

              {user?.id === comment.user_id && (
                <button
                  className={`comment-section__delete ${
                    confirmingId === comment.id
                      ? 'comment-section__delete--confirm'
                      : ''
                  }`}
                  onClick={() =>
                    handleDeleteClick(comment.id)
                  }
                  disabled={
                    deletingId === comment.id
                  }
                >
                  {confirmingId === comment.id
                    ? 'Confirmer la suppression'
                    : '🗑️ Supprimer'}
                </button>
              )}
            </div>
          ))}
      </div>
    </section>
  )
}

export default CommentSection