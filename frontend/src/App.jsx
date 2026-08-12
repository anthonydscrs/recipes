import Header from './components/Header'
import RecipeCard from './components/RecipeCard'

const mockRecipes = [
  {
    id: 1,
    title: 'Pappardelle au bœuf braisé',
    description:
      'Des côtes de bœuf mijotées lentement dans un Barolo, effilochées et mélangées à des pappardelles fraîches.',
    image:
      'https://images.unsplash.com/photo-1484325881845-65073528922e?w=600&h=420&fit=crop&auto=format',
    season: 'Hiver',
    category: 'Plat',
     tags: 'viande',
  },
  {
    id: 2,
    title: 'Spaghetti al Pomodoro',
    description:
      'Quatre ingrédients, quinze minutes de cuisson active. L’idéal platonicien d’une sauce tomate.',
    image:
      'https://images.unsplash.com/photo-1713561058969-793049b01712?w=600&h=420&fit=crop&auto=format',
    season: 'Été',
    category: 'Plat',
     tags: 'féculent',
  },
  {
    id: 3,
    title: 'Tarte banane & chocolat noir',
    description:
      'Une pâte brisée croustillante garnie d’une ganache 70 % et de bananes caramélisées.',
    image:
      'https://images.unsplash.com/photo-1781611172399-60ffdb6be527?w=600&h=420&fit=crop&auto=format',
    season: 'Hiver',
    category: 'Dessert',
     tags: 'végé',
  },
    {
    id: 4,
    title: 'Tarte banane & chocolat noir',
    description:
      'Une pâte brisée croustillante garnie d’une ganache 70 % et de bananes caramélisées.',
    image:
      'https://images.unsplash.com/photo-1781611172399-60ffdb6be527?w=600&h=420&fit=crop&auto=format',
    season: 'Hiver',
    category: 'Dessert',
     tags: 'viande',
  },
    {
    id: 5,
    title: 'Tarte banane & chocolat noir',
    description:
      'Une pâte brisée croustillante garnie d’une ganache 70 % et de bananes caramélisées.',
    image:
      'https://images.unsplash.com/photo-1781611172399-60ffdb6be527?w=600&h=420&fit=crop&auto=format',
    season: 'Hiver',
    category: 'Dessert',
     tags: 'féculent',
  },
    {
    id: 6,
    title: 'Tarte banane & chocolat noir',
    description:
      'Une pâte brisée croustillante garnie d’une ganache 70 % et de bananes caramélisées.',
    image:
      'https://images.unsplash.com/photo-1781611172399-60ffdb6be527?w=600&h=420&fit=crop&auto=format',
    season: 'Hiver',
    category: 'Dessert',
     tags: 'végé',
  },
    {
    id: 7,
    title: 'Spaghetti al Pomodoro',
    description:
      'Quatre ingrédients, quinze minutes de cuisson active. L’idéal platonicien d’une sauce tomate.',
    image:
      'https://images.unsplash.com/photo-1713561058969-793049b01712?w=600&h=420&fit=crop&auto=format',
    season: 'Été',
    category: 'Plat',
    tags: 'féculent',
  },
]

function App() {
  return (
    <>
      <Header />

      <main className="recipes-grid">
        {mockRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
          />
        ))}
      </main>
    </>
  )
}

export default App