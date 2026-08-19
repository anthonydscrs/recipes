import { NavLink, useNavigate } from 'react-router-dom'
import './Header.css'
import {
  Utensils,
  ShoppingCart,
  CalendarDays,
   LogOut
} from 'lucide-react'
import { useAuth } from '../contexts_tmp/AuthContext'

const navLinkClass = ({ isActive }) =>
  `header__link ${isActive ? 'header__link--active' : ''}`

function Header() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header__container">

        <NavLink className="header__logo" to="/">
          Jiji-sama
        </NavLink>

        <nav className="header__nav">

          <NavLink
            className={navLinkClass}
            to="/"
            end
          >
            <Utensils className="header__icon" />
            <span>Recettes</span>
          </NavLink>

          <NavLink
            className={navLinkClass}
            to="/courses"
          >
            <ShoppingCart className="header__icon" />
            <span>Liste de courses</span>
          </NavLink>

          <NavLink
            className={navLinkClass}
            to="/planning"
          >
            <CalendarDays className="header__icon" />
            <span>Planning</span>
          </NavLink>

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