-- ============================================
-- GROUPS (foyer / couple)
-- ============================================
CREATE TABLE IF NOT EXISTS groups  (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NULL,
  pseudo VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

-- ============================================
-- RECIPES (visibles par tout le groupe)
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  created_by INT NULL,

  title VARCHAR(150) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),

 category VARCHAR(150) NOT NULL,
  season ENUM('Été', 'Hiver') NOT NULL,

  ingredients TEXT NOT NULL,     -- un ingrédient par ligne
  preparation TEXT NOT NULL,     -- une étape par ligne

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- FAVORITES (personnel, par user)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
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
CREATE TABLE IF NOT EXISTS notes (
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
-- RATINGS (note en étoiles, personnelle par user, sur une recette)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  value TINYINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,

  UNIQUE (user_id, recipe_id),
  CHECK (value BETWEEN 1 AND 5)
);

-- ============================================
-- SHOPPING LIST (partagée par groupe, persiste)
-- ============================================
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  added_by INT NULL,

  label VARCHAR(255) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- PLANNING (repas de la semaine, partagé par groupe)
-- ============================================
CREATE TABLE IF NOT EXISTS planning_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  recipe_id INT NOT NULL,
  added_by INT NULL,
 
  day ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NOT NULL,
  meal ENUM('dejeuner', 'diner') NOT NULL,
 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
 
  UNIQUE (group_id, day, meal)
);

-- ============================================
-- COMMENTS (plus tard — sous une recette, visible par le groupe)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
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

  INSERT INTO users (id, group_id, pseudo, password_hash) VALUES
(
  1,
  1,
  'Anthony',
  '$2b$10$lq2zyUhjZv5brlrnTyWzYexAbBdVWNY.mzCzjIkhiAa7LrWWzpXWm'
),
(
  2,
  1,
  'Emma',
  '$2b$10$lq2zyUhjZv5brlrnTyWzYexAbBdVWNY.mzCzjIkhiAa7LrWWzpXWm'
);


INSERT INTO recipes
  (id, group_id, created_by, title, description, image_url, category, season, ingredients, preparation)
VALUES

(
  3, 1, 1,
  'Shakshuka',
  'Des œufs mijotés dans une sauce tomate parfumée au paprika, cumin et poivron.',
  'https://i2.wp.com/www.downshiftology.com/wp-content/uploads/2023/12/Shakshuka-main-1.jpg',
  'végé',
  'Été',
  '4 œufs
400 g de tomates concassées
1 poivron rouge
1 oignon
2 gousses d''ail
1 cuillère à café de cumin
1 cuillère à café de paprika
1/2 cuillère à café de piment
Huile d''olive
Sel et poivre
Persil ou coriandre frais',
  'Émincer l''oignon et le poivron.
Faire revenir l''oignon dans un filet d''huile d''olive.
Ajouter le poivron et laisser cuire quelques minutes.
Ajouter l''ail, le cumin, le paprika et le piment.
Verser les tomates concassées et laisser mijoter environ 15 minutes.
Former quatre petits puits dans la sauce et y casser les œufs.
Couvrir et laisser cuire jusqu''à ce que les blancs soient pris tout en gardant les jaunes légèrement coulants.
Parsemer de persil ou de coriandre avant de servir.'
),

(
  4, 1, 1,
  'Salade boulgour quinoa, chorizo et feta',
  'Une salade fraîche et complète mêlant boulgour, quinoa, chorizo, feta et légumes croquants avec une sauce soja-miel.',
  'https://media.hellofresh.com/q_100,w_3840,f_auto,c_limit,fl_lossy/recipes/image/553652f46ced6e7d068b4567.jpg',
  'féculent,viande',
  'Été',
  '100 g de boulgour
100 g de quinoa
100 g de chorizo
100 g de feta
2 poignées d''épinards frais
1/2 concombre
150 g de tomates cerises
1/2 oignon rouge
50 g d''olives noires
1 cuillère à soupe de miel
2 cuillères à soupe de sauce soja
1 cuillère à soupe de vinaigre
2 cuillères à soupe d''huile d''olive
Sel et poivre',
  'Cuire le boulgour et le quinoa selon les indications des paquets puis laisser refroidir.
Couper le chorizo en petits morceaux et le faire légèrement griller à la poêle.
Couper le concombre, les tomates cerises et l''oignon rouge.
Dans un grand saladier, mélanger le boulgour, le quinoa, les épinards, les légumes, les olives et le chorizo.
Émietter la feta par-dessus.
Préparer la sauce en mélangeant le miel, la sauce soja, le vinaigre et l''huile.
Verser la sauce sur la salade, mélanger et assaisonner.'
),

(
  5, 1, 1,
  'Quiche aux poireaux',
  'Une quiche fondante aux poireaux avec une préparation crémeuse aux œufs.',
  'https://cache.marieclaire.fr/data/photo/w1000_ci/1s8/quiche-poireaux-emmental.jpg',
  'végé',
  'Hiver',
  '1 pâte brisée
3 poireaux
3 œufs
20 cl de crème fraîche
10 cl de lait
100 g de gruyère râpé
1 noix de beurre
Sel et poivre
Muscade',
  'Préchauffer le four à 180°C.
Émincer les poireaux et les faire fondre doucement dans une poêle avec le beurre pendant environ 15 minutes.
Foncer un moule avec la pâte brisée et la piquer avec une fourchette.
Battre les œufs avec la crème et le lait.
Ajouter le sel, le poivre et une pincée de muscade.
Répartir les poireaux sur la pâte.
Verser l''appareil aux œufs puis parsemer de gruyère.
Enfourner environ 35 à 40 minutes jusqu''à ce que la quiche soit bien dorée.'
),

(
  6, 1, 1,
  'Nouilles konjac aux légumes et au poulet',
  'Un wok léger de nouilles konjac, poulet et légumes relevé à la sauce soja.',
  'https://odelices.ouest-france.fr/images/recettes/2025/01/wok-konjac-carotte-poulet-H.jpg',
  'viande',
  'Été',
  '400 g de nouilles konjac
300 g de blanc de poulet
1 carotte
1 courgette
1 poivron rouge
1 oignon
2 gousses d''ail
3 cuillères à soupe de sauce soja
1 cuillère à café de paprika
1 cuillère à café de gingembre
1 cuillère à soupe d''huile de sésame
Poivre',
  'Rincer abondamment les nouilles konjac puis les égoutter.
Couper le poulet en fines lamelles.
Émincer l''oignon et couper les légumes en fines lanières.
Faire chauffer l''huile dans un wok.
Faire revenir le poulet jusqu''à ce qu''il soit bien doré.
Ajouter l''oignon, l''ail, la carotte, la courgette et le poivron.
Faire sauter quelques minutes à feu vif.
Ajouter le gingembre et le paprika.
Ajouter les nouilles konjac et la sauce soja.
Mélanger à feu vif pendant quelques minutes et poivrer avant de servir.'
),

(
  7, 1, 1,
  'Quiche saumon courgette',
  'Une quiche fondante associant saumon frais, courgettes et appareil crémeux.',
  'https://images.lecker.de/zucchini-lachs-quiche/16x9%2Cid%3D81e976c6%2Cb%3Dlecker%2Cw%3D1600%2Ch%3D%2Cca%3D0%2C27.37%2C100%2C72.63%2Crm%3Dsk.jpeg',
  'viande,végé',
  'Été',
  '1 pâte feuilletée
2 courgettes
300 g de saumon frais
4 œufs
25 cl de crème fraîche
1 cuillère à soupe de ciboulette
1 pincée de muscade
Sel et poivre',
  'Préchauffer le four à 180°C.
Couper les courgettes en rondelles et les faire revenir à la poêle pendant environ 10 minutes.
Déposer la pâte dans un moule et la piquer.
Répartir les courgettes sur le fond.
Couper le saumon en dés et le répartir sur les courgettes.
Battre les œufs avec la crème, la ciboulette, la muscade, le sel et le poivre.
Verser l''appareil sur la garniture.
Enfourner environ 25 à 30 minutes.'
),

(
  8, 1, 1,
  'Salade lentilles, concombre, feta et œuf',
  'Une salade complète et fraîche à base de lentilles, concombre, feta et œufs.',
  'https://topassiette.com/assets/images/1771797444534-x54zuvox.jpg',
  'végé',
  'Été',
  '250 g de lentilles vertes cuites
1 concombre
150 g de feta
4 œufs
1/2 oignon rouge
1 poignée de persil
2 cuillères à soupe d''huile d''olive
1 cuillère à soupe de vinaigre balsamique
1 cuillère à café de moutarde
Sel et poivre',
  'Cuire les lentilles si elles sont crues puis les laisser refroidir.
Cuire les œufs environ 9 minutes dans l''eau bouillante puis les refroidir.
Couper le concombre et l''oignon rouge.
Mélanger les lentilles, le concombre, l''oignon et le persil.
Préparer la vinaigrette avec l''huile d''olive, le vinaigre, la moutarde, le sel et le poivre.
Verser la vinaigrette sur la salade et mélanger.
Ajouter la feta émiettée.
Couper les œufs en quartiers et les déposer sur la salade.'
),

(
  9, 1, 1,
  'Wok de bœuf et légumes',
  'Un wok de rumsteck sauté avec petits pois, carottes et concombre dans une sauce soja au gingembre.',
  'https://kellystilwell.com/wp-content/uploads/2023/12/chicken-steak-stir-fry-11.jpg',
  'viande',
  'Été',
  '500 g de rumsteck
150 g de petits pois frais
2 carottes
1/2 concombre
1 oignon
2 gousses d''ail
3 cuillères à soupe de sauce soja
1 cuillère à café de gingembre frais râpé
1 cuillère à café de miel
1 cuillère à café d''huile de sésame
1 cuillère à soupe d''huile neutre
Poivre',
  'Couper le rumsteck en fines lamelles.
Mélanger la sauce soja, le gingembre, le miel et l''huile de sésame.
Émincer l''oignon et couper les carottes en fines lamelles.
Couper le concombre en bâtonnets.
Faire chauffer très fortement un wok avec l''huile.
Saisir rapidement le bœuf puis le réserver.
Faire revenir l''oignon et les carottes.
Ajouter les petits pois puis le concombre.
Remettre le bœuf dans le wok.
Verser la sauce et faire sauter le tout quelques minutes à feu vif.
Poivrer et servir immédiatement.'
),

(
  10, 1, 1,
  'Tarte courgette, feta et lardons',
  'Une tarte salée fondante aux courgettes, feta et lardons.',
  'https://www.yiannislucacos.gr/sites/default/files/styles/ogimage/public/tartakolokithibacon.jpg?itok=VvsmLHjC',
  'viande,végé',
  'Été',
  '1 pâte brisée
2 courgettes
150 g de lardons
150 g de feta
3 œufs
20 cl de crème fraîche
1 oignon
1 cuillère à soupe d''huile d''olive
Sel et poivre
Herbes de Provence',
  'Préchauffer le four à 180°C.
Émincer l''oignon et couper les courgettes en rondelles.
Faire revenir les lardons puis ajouter l''oignon et les courgettes.
Laisser cuire jusqu''à ce que les courgettes aient rendu une partie de leur eau.
Déposer la pâte dans un moule et la piquer.
Battre les œufs avec la crème, le sel, le poivre et les herbes de Provence.
Répartir les courgettes et les lardons sur la pâte.
Verser l''appareil aux œufs.
Émietter la feta par-dessus.
Enfourner environ 35 minutes.'
),

(
  11, 1, 1,
  'Salade César',
  'Une salade César gourmande au poulet, parmesan, citron et oignon rouge avec des oignons frits croustillants.',
  'https://www.yumelise.fr/wp-content/uploads/2023/06/salade-cesar.jpg',
  'viande',
  'Été',
  '2 cœurs de laitue romaine
2 filets de poulet
40 g de parmesan
1/2 oignon rouge
1 citron
40 g d''oignons frits
4 tranches de pain
1 gousse d''ail
2 cuillères à soupe de mayonnaise
1 cuillère à café de moutarde
1 cuillère à soupe de parmesan râpé
2 cuillères à soupe d''huile d''olive
Sel et poivre',
  'Couper le pain en dés et le faire griller avec un peu d''huile et la gousse d''ail.
Faire cuire les filets de poulet à la poêle puis les couper en lamelles.
Émincer la salade et l''oignon rouge.
Préparer la sauce avec la mayonnaise, la moutarde, le parmesan râpé, le jus de citron et l''huile d''olive.
Assaisonner avec le sel et le poivre.
Mélanger la salade avec la sauce.
Ajouter le poulet, le parmesan en copeaux, l''oignon rouge, les croûtons et les oignons frits.'
),

(
  12, 1, 1,
  'Risotto poulet champignons',
  'Un risotto crémeux au poulet et aux champignons.',
  'https://mydelightrecipes.com/wp-content/uploads/2025/02/foodmacronutrients_Chicken_and_Mushroom_Risotto_Amateur_photo_f_7ba00a10-bd05-4bba-829a-c5c265835fc8.png',
  'viande,féculent',
  'Hiver',
  '300 g de riz à risotto
300 g de blancs de poulet
250 g de champignons de Paris
1 oignon
2 gousses d''ail
1 litre de bouillon de volaille
10 cl de vin blanc
40 g de parmesan
20 g de beurre
2 cuillères à soupe d''huile d''olive
Sel et poivre',
  'Couper le poulet en morceaux et les champignons en lamelles.
Faire dorer le poulet dans une poêle avec un peu d''huile puis réserver.
Faire revenir l''oignon et l''ail dans une grande poêle.
Ajouter les champignons et cuire quelques minutes.
Ajouter le riz et le faire revenir jusqu''à ce qu''il devienne légèrement translucide.
Verser le vin blanc et laisser évaporer.
Ajouter progressivement le bouillon chaud, louche après louche, en attendant que le liquide soit absorbé entre chaque ajout.
À mi-cuisson, ajouter le poulet.
Lorsque le riz est crémeux et encore légèrement ferme, couper le feu.
Ajouter le beurre et le parmesan.
Mélanger, couvrir quelques minutes puis servir.'
),

(
  13, 1, 1,
  'Marry Me Tortellini',
  'Des tortellini crémeux avec tomates séchées, épinards, ail et parmesan, inspirés de la recette virale Marry Me.',
  'https://therecipecritic.com/wp-content/uploads/2025/01/one-pot-marry-me-tortellini-1-1-1200x1799.jpg',
  'féculent,végé',
  'Hiver',
  '500 g de tortellini au fromage
6 gousses d''ail
100 g de tomates séchées à l''huile
1 cuillère à café d''herbes italiennes
1 pincée de piment
2 cuillères à soupe de farine
50 cl de bouillon de légumes
20 cl de crème liquide
100 g d''épinards frais
100 g de parmesan râpé
2 cuillères à soupe d''huile d''olive
Sel et poivre',
  'Faire chauffer l''huile d''olive dans une grande poêle.
Ajouter l''ail haché, les tomates séchées, les herbes italiennes et le piment.
Faire revenir quelques minutes.
Ajouter la farine et mélanger pour former un roux.
Verser progressivement le bouillon de légumes en mélangeant.
Laisser épaissir quelques minutes.
Ajouter les tortellini et cuire selon leur temps de cuisson en remuant régulièrement.
Couper le feu puis ajouter la crème, le parmesan et les épinards.
Mélanger jusqu''à ce que les épinards soient fondus et que la sauce soit crémeuse.
Assaisonner avec le sel et le poivre.'
),

(
  14, 1, 1,
  'Poulet miel et haricots verts',
  'Des morceaux de poulet caramélisés au miel accompagnés de haricots verts croquants.',
  'https://mykitchenettebya.com/wp-content/uploads/2026/02/626778047_1458151362550232_6024933625573457311_n.jpg',
  'viande',
  'Été',
  '500 g de blancs de poulet
400 g de haricots verts
2 gousses d''ail
2 cuillères à soupe de miel
2 cuillères à soupe de sauce soja
1 cuillère à soupe d''huile d''olive
1 cuillère à café de gingembre
1 cuillère à café de jus de citron
Sel et poivre',
  'Cuire les haricots verts dans une casserole d''eau bouillante salée puis les égoutter.
Couper le poulet en morceaux.
Mélanger le miel, la sauce soja, le gingembre et le jus de citron.
Faire dorer le poulet dans une poêle avec l''huile d''olive.
Ajouter l''ail haché puis verser la sauce au miel.
Laisser caraméliser quelques minutes.
Ajouter les haricots verts et mélanger pour les enrober de sauce.
Poivrer et servir chaud.'
),

(
  15, 1, 1,
  'Gnocchis crème chorizo',
  'Des gnocchis fondants nappés d''une sauce crémeuse au chorizo.',
  'https://i.ytimg.com/vi/-e-AtDn4ZvQ/sddefault.jpg',
  'viande,féculent',
  'Hiver',
  '500 g de gnocchis
100 g de chorizo
20 cl de crème liquide
1 échalote
1 gousse d''ail
5 cl de vin blanc
1 cuillère à café de concentré de tomate
30 g de parmesan
1 poignée d''épinards frais
1 noix de beurre
Sel et poivre',
  'Émincer l''échalote et hacher l''ail.
Couper le chorizo en petits dés.
Faire revenir l''échalote et l''ail dans une noix de beurre.
Ajouter le chorizo et laisser cuire quelques minutes.
Déglacer avec le vin blanc et laisser réduire.
Ajouter la crème et le concentré de tomate.
Laisser mijoter jusqu''à obtenir une sauce crémeuse.
Ajouter le parmesan et les épinards.
Faire cuire les gnocchis selon les indications du paquet puis les ajouter à la sauce.
Mélanger et poivrer avant de servir.'
),

(
  16, 1, 1,
  'Risotto tomate burrata',
  'Un risotto crémeux à la tomate accompagné de burrata fondante et de basilic.',
  'https://tastingwithtina.com/wp-content/uploads/2025/08/burrata_risotto-final2-681x1024.jpg',
  'féculent,végé',
  'Été',
  '320 g de riz Arborio ou Carnaroli
1 oignon
400 g de tomates concassées
1 litre de bouillon de légumes
2 burratas
40 g de parmesan
30 g de beurre
Basilic frais
Huile d''olive
Sel et poivre',
  'Faire chauffer le bouillon de légumes dans une casserole.
Émincer finement l''oignon et le faire revenir dans un filet d''huile d''olive.
Ajouter le riz et le faire toaster quelques minutes.
Ajouter progressivement le bouillon chaud en mélangeant régulièrement.
À mi-cuisson, ajouter les tomates concassées.
Continuer à ajouter le bouillon jusqu''à ce que le riz soit crémeux et cuit al dente.
Couper le feu et incorporer le beurre et le parmesan.
Mélanger puis laisser reposer quelques minutes.
Servir avec la burrata au centre et quelques feuilles de basilic.'
),

(
  17, 1, 1,
  'Poulet Gaston',
  'Des blancs de poulet gratinés avec une sauce crémeuse à la moutarde, au vin blanc et au gruyère.',
  'https://images.squarespace-cdn.com/content/v1/6109e64cfe878a0cad199515/1646699608058-794FRFRVWCYDJ2FL0FU5/IMG_8973.jpg',
  'viande',
  'Hiver',
  '4 blancs de poulet
1 oignon
1 cuillère à soupe de moutarde
20 cl de crème fraîche
1 verre de vin blanc sec
100 g de gruyère râpé
1 noix de beurre
Sel et poivre',
  'Faire dorer les blancs de poulet dans une poêle avec le beurre.
Saler et poivrer puis les déposer dans un plat allant au four.
Préchauffer le four à 170°C.
Émincer l''oignon et le faire revenir dans la poêle.
Ajouter la moutarde, la crème fraîche et le vin blanc.
Laisser mijoter environ 10 minutes.
Verser la sauce sur les blancs de poulet.
Saupoudrer de gruyère râpé.
Enfourner environ 15 minutes jusqu''à ce que le fromage soit bien gratiné.'
);
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  image_url = VALUES(image_url),
  category = VALUES(category),
  season = VALUES(season),
  ingredients = VALUES(ingredients),
  preparation = VALUES(preparation);