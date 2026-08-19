import { useState, useRef } from 'react'
import './AddRecipe.css'

const CATEGORIES = [
  { value: 'viande', label: '🥩 Viande' },
  { value: 'végé', label: '🥦 Végé' },
  { value: 'féculent', label: '🌾 Féculent' },
  { value: 'dessert', label: '🍰 Dessert' },
]

const SEASONS = [
  { value: 'Été', label: '☀️ Été' },
  { value: 'Hiver', label: '❄️ Hiver' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  image_url: '',
  category: ['viande'],
  season: 'Été',
  ingredients: '',
  preparation: '',
}

function AddRecipe({ onBack, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState(null)

  const fileInputRef = useRef(null)

  /*
   * =========================
   * AUTH
   * =========================
   */

  const getAuthUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem('user') || 'null'
      )
    } catch {
      return null
    }
  }

  const getToken = () => {
    return localStorage.getItem('token')
  }

  /*
   * =========================
   * FORM
   * =========================
   */

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }))

  // Multi-sélection : au moins une catégorie
  const toggleCategory = (value) => {
    setForm((f) => {
      const has = f.category.includes(value)

      if (has) {
        if (f.category.length === 1) return f

        return {
          ...f,
          category: f.category.filter(
            (c) => c !== value
          ),
        }
      }

      return {
        ...f,
        category: [...f.category, value],
      }
    })
  }

  /*
   * =========================
   * IMAGE
   * =========================
   */

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setImageError(null)

    // Preview immédiate
    setImagePreview(URL.createObjectURL(file))

    const body = new FormData()
    body.append('image', file)

    setUploadingImage(true)

    try {
      const token = getToken()

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      )

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({}))

        throw new Error(
          data.error ||
            "Erreur lors de l'envoi de l'image"
        )
      }

      const data = await res.json()

      setForm((f) => ({
        ...f,
        image_url: data.image_url,
      }))
    } catch (err) {
      setImageError(err.message)
      setImagePreview('')

      setForm((f) => ({
        ...f,
        image_url: '',
      }))
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImagePreview('')

    setForm((f) => ({
      ...f,
      image_url: '',
    }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /*
   * =========================
   * SUBMIT
   * =========================
   */

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !form.title.trim() ||
      !form.ingredients.trim() ||
      !form.preparation.trim()
    ) {
      setError(
        'Titre, ingrédients et préparation sont requis.'
      )
      return
    }

    if (uploadingImage) {
      setError(
        "L'image est encore en cours d'envoi, patiente un instant."
      )
      return
    }

    const user = getAuthUser()
    const token = getToken()

    if (!user || !token) {
      setError(
        'Vous devez être connecté pour ajouter une recette.'
      )
      return
    }

    if (!user.id || !user.groupId) {
      setError(
        "Les informations de l'utilisateur connecté sont incomplètes."
      )
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/recipes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),

            description: form.description.trim(),

            image_url:
              form.image_url.trim() || null,

            category: form.category,

            season: form.season,

            ingredients: form.ingredients,

            preparation: form.preparation,
          }),
        }
      )

      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({}))

        throw new Error(
          body.error ||
            'Erreur lors de la création de la recette'
        )
      }

      const created = await res.json()

      onCreated(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="add-recipe">

      {/* RETOUR */}

      <button
        className="add-recipe__back"
        onClick={onBack}
        type="button"
      >
        ← TOUTES LES RECETTES
      </button>

      {/* TITRE */}

      <h2 className="add-recipe__title">
        Ajouter une recette
      </h2>

      <p className="add-recipe__subtitle">
        Partagez votre recette avec votre collection.
      </p>

      {/* FORMULAIRE */}

      <form
        className="add-recipe__form"
        onSubmit={handleSubmit}
      >

        {/* TITRE */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Titre *
          </label>

          <input
            className="add-recipe__input"
            value={form.title}
            onChange={set('title')}
            placeholder="Ex. Tarte aux pommes normande"
            required
          />
        </div>

        {/* DESCRIPTION */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Description
          </label>

          <textarea
            className="add-recipe__textarea"
            value={form.description}
            onChange={set('description')}
            placeholder="Décrivez votre recette en quelques mots…"
            rows={3}
          />
        </div>

        {/* IMAGE */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Image
          </label>

          <div className="add-recipe__image-row">

            <div
              className="add-recipe__image-dropzone"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="add-recipe__image-preview"
                />
              ) : (
                <span className="add-recipe__image-placeholder">
                  📷
                  <br />
                  Choisir une image
                </span>
              )}

              {uploadingImage && (
                <div className="add-recipe__image-overlay">
                  Envoi…
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="add-recipe__image-input"
            />

            <div className="add-recipe__image-info">

              <p className="add-recipe__hint">
                Photo depuis votre galerie ou votre appareil
                (JPEG, PNG, WEBP, GIF — 5 Mo max).
              </p>

              {imagePreview && (
                <button
                  type="button"
                  className="add-recipe__image-remove"
                  onClick={removeImage}
                >
                  Retirer l'image
                </button>
              )}

              {imageError && (
                <p className="add-recipe__error">
                  {imageError}
                </p>
              )}

            </div>
          </div>
        </div>

        {/* INGREDIENTS */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Ingrédients *
          </label>

          <textarea
            className="add-recipe__textarea"
            value={form.ingredients}
            onChange={set('ingredients')}
            placeholder={
              '200 g de farine\n2 œufs\n100 ml de lait…'
            }
            rows={5}
            required
          />

          <p className="add-recipe__hint">
            Un ingrédient par ligne.
          </p>
        </div>

        {/* PREPARATION */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Préparation *
          </label>

          <textarea
            className="add-recipe__textarea"
            value={form.preparation}
            onChange={set('preparation')}
            placeholder={
              'Préchauffer le four à 180°C.\nMélanger la farine et les œufs…'
            }
            rows={6}
            required
          />

          <p className="add-recipe__hint">
            Une étape par ligne.
          </p>
        </div>

        {/* SAISON */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Saison
          </label>

          <div className="add-recipe__toggle-group">

            {SEASONS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`add-recipe__toggle ${
                  form.season === s.value
                    ? 'add-recipe__toggle--active'
                    : ''
                }`}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    season: s.value,
                  }))
                }
              >
                {s.label}
              </button>
            ))}

          </div>
        </div>

        {/* CATEGORIES */}

        <div className="add-recipe__field">
          <label className="add-recipe__label">
            Catégorie(s)
          </label>

          <div className="add-recipe__toggle-group">

            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`add-recipe__toggle ${
                  form.category.includes(c.value)
                    ? 'add-recipe__toggle--active'
                    : ''
                }`}
                onClick={() =>
                  toggleCategory(c.value)
                }
              >
                {c.label}
              </button>
            ))}

          </div>

          <p className="add-recipe__hint">
            Sélectionne une ou plusieurs catégories.
          </p>
        </div>

        {/* ERREUR */}

        {error && (
          <p className="add-recipe__error">
            {error}
          </p>
        )}

        {/* BOUTON */}

        <button
          className="add-recipe__submit"
          type="submit"
          disabled={
            submitting || uploadingImage
          }
        >
          {submitting
            ? 'Ajout…'
            : 'Ajouter la recette'}
        </button>

      </form>

    </main>
  )
}

export default AddRecipe