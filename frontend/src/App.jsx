import { useState } from 'react'
import Header from './components/Header'
import RecipeCard from './components/RecipeCard'
import RecipeDetail from './pages/RecipeDetail'

const mockRecipes = [
  {
    id: 1,
    title: 'Pappardelle au bœuf braisé',
    description:
      'Des côtes de bœuf mijotées lentement dans un Barolo, effilochées et mélangées à des pappardelles fraîches.',
    image:
      'https://images.unsplash.com/photo-1484325881845-65073528922e?w=900&h=600&fit=crop&auto=format',
    season: 'Hiver',
    category: 'viande',
    ingredients: [
      '800 g de côtes de bœuf',
      '400 g de pappardelles',
      '1 bouteille de Barolo',
      '2 carottes',
      '2 branches de céleri',
      '1 oignon',
      '2 gousses d’ail',
      '2 cuillères à soupe de concentré de tomate',
      'Huile d’olive',
      'Sel et poivre',
    ],
    preparation: [
      'Faire dorer les côtes de bœuf dans une cocotte avec un peu d’huile.',
      'Ajouter l’oignon, les carottes, le céleri et l’ail puis faire revenir quelques minutes.',
      'Ajouter le concentré de tomate et mélanger.',
      'Verser le Barolo et porter à ébullition.',
      'Couvrir et laisser mijoter environ 3 heures à feu doux.',
      'Effilocher la viande et la mélanger avec la sauce.',
      'Cuire les pappardelles puis les mélanger avec la sauce au bœuf.',
    ],
  },

  {
    id: 2,
    title: 'Spaghetti al Pomodoro',
    description:
      'Quatre ingrédients, quinze minutes de cuisson active. L’idéal platonicien d’une sauce tomate.',
    image:
      'https://images.unsplash.com/photo-1713561058969-793049b01712?w=900&h=600&fit=crop&auto=format',
    season: 'Été',
    category: 'féculent',
    ingredients: [
      '200 g de spaghetti',
      '400 g de tomates concassées',
      '2 gousses d’ail',
      'Basilic frais',
      'Huile d’olive',
      'Sel et poivre',
      'Parmesan',
    ],
    preparation: [
      'Faire chauffer l’huile d’olive dans une poêle.',
      'Ajouter l’ail et le faire revenir légèrement.',
      'Ajouter les tomates concassées et laisser mijoter 10 minutes.',
      'Faire cuire les spaghetti dans une grande casserole d’eau salée.',
      'Égoutter les pâtes en conservant un peu d’eau de cuisson.',
      'Mélanger les spaghetti avec la sauce tomate.',
      'Ajouter le basilic frais et le parmesan avant de servir.',
    ],
  },

  {
    id: 3,
    title: 'Tarte banane & chocolat noir',
    description:
      'Une pâte brisée croustillante garnie d’une ganache 70 % et de bananes caramélisées.',
    image:
      'https://images.unsplash.com/photo-1781611172399-60ffdb6be527?w=900&h=600&fit=crop&auto=format',
    season: 'Hiver',
    category: 'dessert',
    ingredients: [
      '1 pâte brisée',
      '200 g de chocolat noir 70 %',
      '20 cl de crème liquide',
      '3 bananes',
      '30 g de beurre',
      '40 g de sucre roux',
    ],
    preparation: [
      'Préchauffer le four à 180 °C.',
      'Foncer la pâte dans un moule et la faire précuire 10 minutes.',
      'Faire fondre le chocolat avec la crème pour réaliser la ganache.',
      'Couper les bananes en rondelles.',
      'Faire caraméliser les bananes avec le beurre et le sucre.',
      'Verser la ganache sur le fond de tarte.',
      'Disposer les bananes caramélisées sur le dessus.',
      'Cuire environ 25 minutes puis laisser refroidir.',
    ],
  },

  {
    id: 4,
    title: 'Poulet rôti aux herbes',
    description:
      'Un poulet rôti simplement avec de l’ail, du thym et du romarin.',
    image:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&h=600&fit=crop&auto=format',
    season: 'Hiver',
    category: 'viande',
    ingredients: [
      '1 poulet entier',
      '4 gousses d’ail',
      'Thym',
      'Romarin',
      '2 cuillères à soupe d’huile d’olive',
      'Sel',
      'Poivre',
    ],
    preparation: [
      'Préchauffer le four à 200 °C.',
      'Badigeonner le poulet avec l’huile d’olive.',
      'Ajouter l’ail, le thym et le romarin.',
      'Saler et poivrer généreusement.',
      'Enfourner pendant environ 1 h 15.',
      'Arroser régulièrement avec le jus de cuisson.',
      'Laisser reposer quelques minutes avant de découper.',
    ],
  },

  {
    id: 5,
    title: 'Risotto crémeux aux champignons',
    description:
      'Un risotto italien onctueux aux champignons et au parmesan.',
    image:
      'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=900&h=600&fit=crop&auto=format',
    season: 'Automne',
    category: 'féculent',
    ingredients: [
      '300 g de riz arborio',
      '300 g de champignons',
      '1 oignon',
      '1 L de bouillon de légumes',
      '15 cl de vin blanc',
      '60 g de parmesan',
      '30 g de beurre',
      'Huile d’olive',
      'Sel et poivre',
    ],
    preparation: [
      'Faire revenir l’oignon émincé dans l’huile d’olive.',
      'Ajouter les champignons et les faire dorer.',
      'Ajouter le riz et le nacrer pendant quelques minutes.',
      'Verser le vin blanc et laisser évaporer.',
      'Ajouter progressivement le bouillon chaud en mélangeant régulièrement.',
      'Continuer la cuisson pendant environ 18 minutes.',
      'Ajouter le beurre et le parmesan hors du feu.',
      'Mélanger puis servir immédiatement.',
    ],
  },

  {
    id: 6,
    title: 'Salade méditerranéenne',
    description:
      'Une salade fraîche composée de tomates, concombre, feta et olives.',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&h=600&fit=crop&auto=format',
    season: 'Été',
    category: 'végé',
    ingredients: [
      '3 tomates',
      '1 concombre',
      '100 g de feta',
      '80 g d’olives noires',
      '1/2 oignon rouge',
      'Huile d’olive',
      'Jus de citron',
      'Origan',
      'Sel et poivre',
    ],
    preparation: [
      'Couper les tomates et le concombre.',
      'Émincer finement l’oignon rouge.',
      'Ajouter les olives et la feta coupée en dés.',
      'Préparer une vinaigrette avec l’huile d’olive et le citron.',
      'Assaisonner avec l’origan, le sel et le poivre.',
      'Mélanger délicatement et servir frais.',
    ],
  },
]

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  if (selectedRecipe) {
    return (
      <>
        <Header />

        <RecipeDetail
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
        />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="recipes-grid">
        {mockRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={setSelectedRecipe}
          />
        ))}
      </main>
    </>
  )
}

export default App