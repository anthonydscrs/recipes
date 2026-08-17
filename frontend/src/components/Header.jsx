import './Header.css'
import {
  Utensils,
  ShoppingCart,
  CalendarDays,
   LogOut
} from 'lucide-react'

function Header({ tab, setTab }) {

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    window.location.reload()
  }

  return (
    <header className="header">
      <div className="header__container">

        <button
          className="header__logo"
          onClick={() => setTab('recettes')}
        >
          Jiji-sama
        </button>

        <nav className="header__nav">

          <button
            className={`header__link ${
              tab === 'recettes'
                ? 'header__link--active'
                : ''
            }`}
            onClick={() => setTab('recettes')}
          >
            <Utensils className="header__icon" />
            <span>Recettes</span>
          </button>

          <button
            className={`header__link ${
              tab === 'courses'
                ? 'header__link--active'
                : ''
            }`}
            onClick={() => setTab('courses')}
          >
            <ShoppingCart className="header__icon" />
            <span>Liste de courses</span>
          </button>

          <button
            className={`header__link ${
              tab === 'planning'
                ? 'header__link--active'
                : ''
            }`}
            onClick={() => setTab('planning')}
          >
            <CalendarDays className="header__icon" />
            <span>Planning</span>
          </button>

        </nav>

  <button
  className="header__logout"
  onClick={handleLogout}
  aria-label="Déconnexion"
>
  <LogOut className="header__logout-icon" />
  <span>Déconnexion</span>
</button>

      </div>
    </header>
  )
}

export default Header