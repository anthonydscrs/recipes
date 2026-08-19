import { Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './contexts/AuthContext'
import { RecipesProvider } from './contexts/RecipesContext'

import MainLayout from './layouts/MainLayout'

import Login from './pages/Login'
import RecipesPage from './pages/RecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import AddRecipePage from './pages/AddRecipePage'
import EditRecipePage from './pages/EditRecipePage'
import ShoppingList from './pages/ShoppingList'
import Planning from './pages/Planning'

// ============================================
// ZONE PRIVÉE (connecté uniquement)
// ============================================
// Fournit RecipesContext + Header à toutes les
// routes qui nécessitent d'être authentifié.

function PrivateArea() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <RecipesProvider>
      <MainLayout />
    </RecipesProvider>
  )
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route element={<PrivateArea />}>
        <Route path="/" element={<RecipesPage />} />
        <Route
          path="/recette/ajouter"
          element={<AddRecipePage />}
        />
        <Route
          path="/recette/:id"
          element={<RecipeDetailPage />}
        />
        <Route
          path="/recette/:id/modifier"
          element={<EditRecipePage />}
        />
        <Route path="/courses" element={<ShoppingList />} />
        <Route path="/planning" element={<Planning />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? '/' : '/login'}
            replace
          />
        }
      />

    </Routes>
  )
}

export default App