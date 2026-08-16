import './Header.css'

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
            Recettes
          </button>

          <button
            className={`header__link ${
              tab === 'courses'
                ? 'header__link--active'
                : ''
            }`}
            onClick={() => setTab('courses')}
          >
            Liste de courses
          </button>

          <button
            className={`header__link ${
              tab === 'planning'
                ? 'header__link--active'
                : ''
            }`}
            onClick={() => setTab('planning')}
          >
            Planning
          </button>

        </nav>

        {/* DÉCONNEXION */}

        <button
          className="header__logout"
          onClick={handleLogout}
        >
          Déconnexion
        </button>

      </div>
    </header>
  )
}

export default Header