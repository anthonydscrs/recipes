import './Header.css'

function Header({ tab, setTab }) {
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
              tab === 'recettes' ? 'header__link--active' : ''
            }`}
            onClick={() => setTab('recettes')}
          >
            Recettes
          </button>

          <button
            className={`header__link ${
              tab === 'courses' ? 'header__link--active' : ''
            }`}
            onClick={() => setTab('courses')}
          >
            Liste de courses
          </button>
        </nav>

      </div>
    </header>
  )
}

export default Header