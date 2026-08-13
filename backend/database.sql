-- ============================================
-- GROUPS (foyer / couple)
-- ============================================
CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  pseudo VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

-- ============================================
-- RECIPES (visibles par tout le groupe)
-- ============================================
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  created_by INT NULL,

  title VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),

  category ENUM('viande', 'végé', 'féculent', 'dessert') NOT NULL,
  season ENUM('Été', 'Hiver', 'Automne', 'Printemps') NOT NULL,

  ingredients TEXT NOT NULL,     -- un ingrédient par ligne
  preparation TEXT NOT NULL,     -- une étape par ligne

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- FAVORITES (personnel, par user)
-- ============================================
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,

  UNIQUE (user_id, recipe_id)
);

-- ============================================
-- NOTES (personnel, par user, sur une recette)
-- ============================================
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,

  UNIQUE (user_id, recipe_id)
);

-- ============================================
-- SHOPPING LIST (partagée par groupe, persiste)
-- ============================================
CREATE TABLE shopping_list_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  added_by INT NULL,

  label VARCHAR(255) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- COMMENTS (plus tard — sous une recette, visible par le groupe)
-- ============================================
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- DONNÉES D'EXEMPLE
-- ============================================

INSERT INTO groups (id, name) VALUES
  (1, 'Foyer de test');

INSERT INTO users (id, group_id, email, password_hash, pseudo) VALUES
  (1, 1, 'anthony@example.com', '$2b$10$placeholderHashToReplace', 'Anthony');

INSERT INTO recipes
  (id, group_id, created_by, title, description, image_url, category, season, ingredients, preparation)
VALUES
(
  1, 1, 1,
  'Pappardelle au bœuf braisé',
  'Des côtes de bœuf mijotées lentement dans un Barolo, effilochées et mélangées à des pappardelles fraîches.',
  'https://images.unsplash.com/photo-1484325881845-65073528922e?w=900&h=600&fit=crop&auto=format',
  'viande', 'Hiver',
  '800 g de côtes de bœuf
400 g de pappardelles
1 bouteille de Barolo
2 carottes
2 branches de céleri
1 oignon
2 gousses d''ail
2 cuillères à soupe de concentré de tomate
Huile d''olive
Sel et poivre',
  'Faire dorer les côtes de bœuf dans une cocotte avec un peu d''huile.
Ajouter l''oignon, les carottes, le céleri et l''ail puis faire revenir quelques minutes.
Ajouter le concentré de tomate et mélanger.
Verser le Barolo et porter à ébullition.
Couvrir et laisser mijoter environ 3 heures à feu doux.
Effilocher la viande et la mélanger avec la sauce.
Cuire les pappardelles puis les mélanger avec la sauce au bœuf.'
),
(
  2, 1, 1,
  'Spaghetti al Pomodoro',
  'Quatre ingrédients, quinze minutes de cuisson active. L''idéal platonicien d''une sauce tomate.',
  'https://images.unsplash.com/photo-1713561058969-793049b01712?w=900&h=600&fit=crop&auto=format',
  'féculent', 'Été',
  '200 g de spaghetti
400 g de tomates concassées
2 gousses d''ail
Basilic frais
Huile d''olive
Sel et poivre
Parmesan',
  'Faire chauffer l''huile d''olive dans une poêle.
Ajouter l''ail et le faire revenir légèrement.
Ajouter les tomates concassées et laisser mijoter 10 minutes.
Faire cuire les spaghetti dans une grande casserole d''eau salée.
Égoutter les pâtes en conservant un peu d''eau de cuisson.
Mélanger les spaghetti avec la sauce tomate.
Ajouter le basilic frais et le parmesan avant de servir.'
),
(
  3, 1, 1,
  'Tarte banane & chocolat noir',
  'Une pâte brisée croustillante garnie d''une ganache 70 % et de bananes caramélisées.',
  'https://images.unsplash.com/photo-1781611172399-60ffdb6be527?w=900&h=600&fit=crop&auto=format',
  'dessert', 'Hiver',
  '1 pâte brisée
200 g de chocolat noir 70 %
20 cl de crème liquide
3 bananes
30 g de beurre
40 g de sucre roux',
  'Préchauffer le four à 180 °C.
Foncer la pâte dans un moule et la faire précuire 10 minutes.
Faire fondre le chocolat avec la crème pour réaliser la ganache.
Couper les bananes en rondelles.
Faire caraméliser les bananes avec le beurre et le sucre.
Verser la ganache sur le fond de tarte.
Disposer les bananes caramélisées sur le dessus.
Cuire environ 25 minutes puis laisser refroidir.'
),
(
  4, 1, 1,
  'Poulet rôti aux herbes',
  'Un poulet rôti simplement avec de l''ail, du thym et du romarin.',
  'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&h=600&fit=crop&auto=format',
  'viande', 'Hiver',
  '1 poulet entier
4 gousses d''ail
Thym
Romarin
2 cuillères à soupe d''huile d''olive
Sel
Poivre',
  'Préchauffer le four à 200 °C.
Badigeonner le poulet avec l''huile d''olive.
Ajouter l''ail, le thym et le romarin.
Saler et poivrer généreusement.
Enfourner pendant environ 1 h 15.
Arroser régulièrement avec le jus de cuisson.
Laisser reposer quelques minutes avant de découper.'
),
(
  5, 1, 1,
  'Risotto crémeux aux champignons',
  'Un risotto italien onctueux aux champignons et au parmesan.',
  'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=900&h=600&fit=crop&auto=format',
  'féculent', 'Automne',
  '300 g de riz arborio
300 g de champignons
1 oignon
1 L de bouillon de légumes
15 cl de vin blanc
60 g de parmesan
30 g de beurre
Huile d''olive
Sel et poivre',
  'Faire revenir l''oignon émincé dans l''huile d''olive.
Ajouter les champignons et les faire dorer.
Ajouter le riz et le nacrer pendant quelques minutes.
Verser le vin blanc et laisser évaporer.
Ajouter progressivement le bouillon chaud en mélangeant régulièrement.
Continuer la cuisson pendant environ 18 minutes.
Ajouter le beurre et le parmesan hors du feu.
Mélanger puis servir immédiatement.'
),
(
  6, 1, 1,
  'Salade méditerranéenne',
  'Une salade fraîche composée de tomates, concombre, feta et olives.',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&h=600&fit=crop&auto=format',
  'végé', 'Été',
  '3 tomates
1 concombre
100 g de feta
80 g d''olives noires
1/2 oignon rouge
Huile d''olive
Jus de citron
Origan
Sel et poivre',
  'Couper les tomates et le concombre.
Émincer finement l''oignon rouge.
Ajouter les olives et la feta coupée en dés.
Préparer une vinaigrette avec l''huile d''olive et le citron.
Assaisonner avec l''origan, le sel et le poivre.
Mélanger délicatement et servir frais.'
);