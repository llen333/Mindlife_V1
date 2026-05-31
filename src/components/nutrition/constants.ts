/**
 * NutritionPage Constants
 * Données statiques pour la page nutrition
 */

import type { VoiceOption, ReadingMode, PeriodOption, Meal, InspirationRecipe } from './types';

// Voice options for TTS (Français via Browser SpeechSynthesis)
export const voiceOptions: VoiceOption[] = [
  { 
    id: 'female-fr', 
    label: 'Amélie', 
    desc: 'Voix féminine douce',
    preview: '.voice-female',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400',
    icon: '👩‍🦰'
  },
  { 
    id: 'male-fr', 
    label: 'Thomas', 
    desc: 'Voix masculine grave',
    preview: '.voice-male',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: '👨'
  },
];

// Reading mode options
export const readingModes: ReadingMode[] = [
  { id: 'step', label: 'Étape par Étape', icon: '📍', desc: 'Navigation guidée', color: 'from-violet-500 to-purple-500' },
  { id: 'full', label: 'Lecture Complète', icon: '📖', desc: 'Toute la recette', color: 'from-amber-500 to-orange-500' },
];

// Period options for shopping
export const periodOptions: PeriodOption[] = [
  { id: 'day', label: 'Jour', multiplier: 1 },
  { id: 'week', label: 'Semaine', multiplier: 7 },
  { id: 'month', label: 'Mois', multiplier: 30 },
];

// Days of week in French
export const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const DAYS_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

// Default meal images
export const defaultImages = [
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
];

// Sample meals data - Lunch
export const weeklyMeals: Meal[] = [
  {
    id: '1',
    day: 'Lundi',
    dayShort: 'Lun.',
    title: 'Saumon Teriyaki & Quinoa Noir',
    description: 'Un plat raffiné combinant la richesse du saumon grillé avec une sauce teriyaki maison et du quinoa noir aux notes de noisette.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    protein: 42,
    calories: 640,
    isToday: true,
    type: 'lunch',
    tags: ['Poisson', 'Healthy'],
    ingredients: [
      { id: '1', name: 'Pavés de saumon frais', quantity: '350', unit: 'g', checked: false, price: 12.50 },
      { id: '2', name: 'Sauce Teriyaki Artisanale', quantity: '60', unit: 'ml', checked: false, price: 4.20 },
      { id: '3', name: 'Quinoa noir', quantity: '200', unit: 'g', checked: false, price: 5.80 },
      { id: '4', name: 'Graines de sésame', quantity: '20', unit: 'g', checked: false, price: 2.10 },
      { id: '5', name: 'Gingembre frais', quantity: '30', unit: 'g', checked: false, price: 1.50 },
    ],
    steps: [
      { id: 1, instruction: 'Rincez le quinoa noir à l\'eau froide et faites-le cuire dans de l\'eau bouillante salée pendant 15 minutes. Égouttez et réservez au chaud.', duration: 15 },
      { id: 2, instruction: 'Pendant ce temps, préparez le saumon. Assaisonnez les pavés avec du sel, du poivre et un filet d\'huile d\'olive.', duration: 2 },
      { id: 3, instruction: 'Faites chauffer une poêle à feu vif. Saisissez le saumon côté peau pendant 3 à 4 minutes jusqu\'à ce qu\'il soit croustillant.', duration: 4 },
      { id: 4, instruction: 'Retournez le saumon délicatement et ajoutez la sauce teriyaki. Laissez caraméliser 2 minutes en arrosant le poisson.', duration: 2 },
      { id: 5, instruction: 'Disposez le quinoa dans les assiettes, ajoutez le saumon par-dessus et nappez avec le reste de sauce.', duration: 1 },
      { id: 6, instruction: 'Parsemez de graines de sésame et de gingembre râpé. Servez immédiatement avec quelques feuilles de coriandre.', duration: 1 },
    ]
  },
  {
    id: '2',
    day: 'Mardi',
    dayShort: 'Mar.',
    title: 'Salade Méditerranéenne au Feta',
    description: 'Une salade fraîche et colorée aux saveurs de la Méditerranée, avec des légumes coquants et du fromage feta crémeux.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    protein: 28,
    calories: 480,
    type: 'lunch',
    tags: ['Végétarien', 'Méditerranéen'],
    ingredients: [
      { id: '1', name: 'Tomates cerises', quantity: '250', unit: 'g', checked: false, price: 3.50 },
      { id: '2', name: 'Concombre', quantity: '1', unit: 'pièce', checked: false, price: 1.20 },
      { id: '3', name: 'Feta grecque AOP', quantity: '150', unit: 'g', checked: false, price: 4.80 },
      { id: '4', name: 'Olives noires de Kalamata', quantity: '100', unit: 'g', checked: false, price: 3.90 },
      { id: '5', name: 'Huile d\'olive extra vierge', quantity: '30', unit: 'ml', checked: false, price: 2.50 },
    ],
    steps: [
      { id: 1, instruction: 'Lavez et coupez les tomates cerises en deux. Épluchez et émincez le concombre en fines rondelles.', duration: 3 },
      { id: 2, instruction: 'Disposez les légumes dans un grand saladier. Ajoutez les olives dénoyautées.', duration: 1 },
      { id: 3, instruction: 'Émiettez le fromage feta par-dessus la salade de manière généreuse.', duration: 1 },
      { id: 4, instruction: 'Assaisonnez avec l\'huile d\'olive, un filet de vinaigre balsamique, du sel et de l\'origan séché.', duration: 1 },
    ]
  },
  {
    id: '3',
    day: 'Mercredi',
    dayShort: 'Mer.',
    title: 'Buddha Bowl Royal Avocat & Noix',
    description: 'Un bol végétarien complet et équilibré, riche en protéines végétales et en graisses saines.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    protein: 35,
    calories: 550,
    type: 'lunch',
    tags: ['Vegan', 'Bowl'],
    ingredients: [
      { id: '1', name: 'Avocats mûrs', quantity: '2', unit: 'pièces', checked: false, price: 3.80 },
      { id: '2', name: 'Riz complet bio', quantity: '200', unit: 'g', checked: false, price: 2.40 },
      { id: '3', name: 'Noix de cajou', quantity: '50', unit: 'g', checked: false, price: 3.20 },
      { id: '4', name: 'Pois chiches en conserve', quantity: '200', unit: 'g', checked: false, price: 1.80 },
    ],
    steps: [
      { id: 1, instruction: 'Faites cuire le riz complet dans de l\'eau bouillante salée pendant 25 minutes. Égouttez et laissez tiédir.', duration: 25 },
      { id: 2, instruction: 'Égouttez les pois chiches et faites-les rôtir au four à 200°C pendant 15 minutes avec des épices.', duration: 15 },
      { id: 3, instruction: 'Préparez l\'avocat en tranches. Assemblez le bowl avec le riz, les pois chiches, l\'avocat et les noix de cajou.', duration: 3 },
    ]
  },
  {
    id: '4',
    day: 'Jeudi',
    dayShort: 'Jeu.',
    title: 'Pasta Arrabbiata & Burrata',
    description: 'Des pâtes italiennes avec une sauce tomate épicée et une burrata onctueuse.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
    protein: 18,
    calories: 610,
    type: 'lunch',
    tags: ['Italien', 'Comfort Food'],
    ingredients: [
      { id: '1', name: 'Pennes italiennes', quantity: '400', unit: 'g', checked: false, price: 2.80 },
      { id: '2', name: 'Tomates pelées San Marzano', quantity: '800', unit: 'g', checked: false, price: 4.50 },
      { id: '3', name: 'Burrata des Pouilles', quantity: '250', unit: 'g', checked: false, price: 8.90 },
      { id: '4', name: 'Piments séchés', quantity: '2', unit: 'pièces', checked: false, price: 1.20 },
    ],
    steps: [
      { id: 1, instruction: 'Faites cuire les pennes dans une grande quantité d\'eau bouillante salée selon les instructions du paquet.', duration: 10 },
      { id: 2, instruction: 'Préparez la sauce arrabbiata : faites revenir l\'ail et les piments, ajoutez les tomates et laissez mijoter 15 minutes.', duration: 15 },
      { id: 3, instruction: 'Mélangez les pâtes égouttées avec la sauce. Servez avec la burrata fraîche et un filet d\'huile d\'olive.', duration: 2 },
    ]
  },
  {
    id: '5',
    day: 'Vendredi',
    dayShort: 'Ven.',
    title: 'Wok Thaï Poulet & Gingembre',
    description: 'Un sauté rapide aux saveurs thaïlandaises avec du poulet tendre et du gingembre frais.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
    protein: 52,
    calories: 720,
    type: 'lunch',
    tags: ['Asiatique', 'Épicé'],
    ingredients: [
      { id: '1', name: 'Blancs de poulet', quantity: '400', unit: 'g', checked: false, price: 8.50 },
      { id: '2', name: 'Gingembre frais', quantity: '50', unit: 'g', checked: false, price: 1.80 },
      { id: '3', name: 'Légumes pour wok mélangés', quantity: '300', unit: 'g', checked: false, price: 4.20 },
      { id: '4', name: 'Sauce soja fermentée', quantity: '60', unit: 'ml', checked: false, price: 2.90 },
    ],
    steps: [
      { id: 1, instruction: 'Coupez le poulet en lamelles et faites-le mariner avec de la sauce soja et du gingembre râpé pendant 10 minutes.', duration: 10 },
      { id: 2, instruction: 'Faites chauffer le wok à feu très vif avec un filet d\'huile de sésame.', duration: 1 },
      { id: 3, instruction: 'Saisissez le poulet rapidement, puis ajoutez les légumes. Faites sauter 5 minutes en remuant constamment.', duration: 6 },
    ]
  },
  {
    id: '6',
    day: 'Samedi',
    dayShort: 'Sam.',
    title: 'Dîner Signature Chef Étoilé',
    description: 'Une expérience gastronomique exceptionnelle avec des produits d\'exception.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    protein: 35,
    calories: 850,
    isFavorite: true,
    type: 'lunch',
    tags: ['Gourmet', 'Signature'],
    ingredients: [
      { id: '1', name: 'Filet de bœuf Aubrac', quantity: '300', unit: 'g', checked: false, price: 24.00 },
      { id: '2', name: 'Foie gras de canard', quantity: '100', unit: 'g', checked: false, price: 18.50 },
      { id: '3', name: 'Légumes de saison primeurs', quantity: '200', unit: 'g', checked: false, price: 6.80 },
      { id: '4', name: 'Sauce aux truffes noires', quantity: '100', unit: 'ml', checked: false, price: 15.00 },
    ],
    steps: [
      { id: 1, instruction: 'Sortez la viande du réfrigérateur 30 minutes avant la cuisson pour qu\'elle soit à température ambiante.', duration: 30 },
      { id: 2, instruction: 'Saisissez le filet de bœuf dans une poêle très chaude, 2 minutes de chaque côté pour une cuisson saignante.', duration: 4 },
      { id: 3, instruction: 'Poêlez le foie gras 1 minute de chaque côté. Dressez sur l\'assiette avec les légumes et nappez de sauce aux truffes.', duration: 3 },
    ]
  },
  {
    id: '7',
    day: 'Dimanche',
    dayShort: 'Dim.',
    title: 'Brunch Pancakes Protéinés',
    description: 'Des pancakes moelleux et riches en protéines pour un brunch énergétique.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
    protein: 38,
    calories: 840,
    type: 'lunch',
    tags: ['Brunch', 'Protéiné'],
    ingredients: [
      { id: '1', name: 'Farine d\'avoine complète', quantity: '200', unit: 'g', checked: false, price: 3.20 },
      { id: '2', name: 'Blancs d\'œufs bio', quantity: '6', unit: 'pièces', checked: false, price: 2.80 },
      { id: '3', name: 'Protéine en poudre vanille', quantity: '30', unit: 'g', checked: false, price: 4.50 },
      { id: '4', name: 'Sirop d\'érable pur', quantity: '60', unit: 'ml', checked: false, price: 5.90 },
    ],
    steps: [
      { id: 1, instruction: 'Mélangez la farine d\'avoine, la protéine en poudre et une pincée de sel dans un grand bol.', duration: 2 },
      { id: 2, instruction: 'Ajoutez les blancs d\'œufs et mélangez jusqu\'à obtenir une pâte lisse et homogène.', duration: 2 },
      { id: 3, instruction: 'Faites cuire les pancakes dans une poêle antiadhésive à feu moyen, 2 minutes de chaque côté.', duration: 10 },
    ]
  },
];

// Dinner meals - different from lunches
export const dinnerMeals: Meal[] = [
  {
    id: 'dinner-1',
    day: 'Dimanche',
    dayShort: 'Dim.',
    title: 'Soupe de Poissons Méditerranéenne',
    description: 'Une soupe riche et parfumée aux saveurs du sud, parfaite pour les soirées d\'hiver avec du pain grillé à l\'ail.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop',
    protein: 28,
    calories: 380,
    type: 'dinner',
    tags: ['Poisson', 'Léger', 'Méditerranéen'],
    ingredients: [
      { id: '1', name: 'Mélange de poissons blancs', quantity: '300', unit: 'g', checked: false, price: 9.00 },
      { id: '2', name: 'Tomates concassées', quantity: '200', unit: 'g', checked: false, price: 2.50 },
      { id: '3', name: 'Ail', quantity: '3', unit: 'gousses', checked: false, price: 0.50 },
      { id: '4', name: 'Huile d\'olive', quantity: '30', unit: 'ml', checked: false, price: 1.80 },
      { id: '5', name: 'Safran', quantity: '1', unit: 'pincée', checked: false, price: 3.00 },
    ],
    steps: [
      { id: 1, instruction: 'Faire revenir l\'ail dans l\'huile d\'olive, ajouter les tomates et le safran.', duration: 5 },
      { id: 2, instruction: 'Ajouter le mélange de poissons et couvrir d\'eau froide. Porter à ébullition.', duration: 10 },
      { id: 3, instruction: 'Laisser mijoter 20 minutes à feu doux. Mixer légèrement pour texture.', duration: 20 },
      { id: 4, instruction: 'Servir avec du pain grillé frotté à l\'ail et un filet d\'huile d\'olive.', duration: 5 },
      { id: 5, instruction: 'Garnir de persil frais et de croûtons à l\'ail.', duration: 3 },
      { id: 6, instruction: 'Accompagner d\'un verre de vin blanc sec si désiré.', duration: 2 },
    ]
  },
  {
    id: 'dinner-2',
    day: 'Lundi',
    dayShort: 'Lun.',
    title: 'Poulet Rôti aux Herbes de Provence',
    description: 'Cuisses de poulet rôties lentement avec des herbes de Provence, servies avec des légumes rôtis.',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop',
    protein: 35,
    calories: 420,
    type: 'dinner',
    isToday: true,
    tags: ['Volaille', 'Traditionnel', 'Rôti'],
    ingredients: [
      { id: '1', name: 'Cuisses de poulet', quantity: '4', unit: 'pièces', checked: false, price: 8.50 },
      { id: '2', name: 'Herbes de Provence', quantity: '2', unit: 'c. à soupe', checked: false, price: 1.20 },
      { id: '3', name: 'Huile d\'olive', quantity: '30', unit: 'ml', checked: false, price: 1.50 },
      { id: '4', name: 'Carottes', quantity: '3', unit: 'pièces', checked: false, price: 1.00 },
      { id: '5', name: 'Pommes de terre', quantity: '500', unit: 'g', checked: false, price: 2.00 },
    ],
    steps: [
      { id: 1, instruction: 'Préchauffer le four à 180°C. Préparer les cuisses de poulet.', duration: 5 },
      { id: 2, instruction: 'Mélanger l\'huile d\'olive avec les herbes de Provence et badigeonner le poulet.', duration: 3 },
      { id: 3, instruction: 'Couper les légumes en morceaux et les disposer autour du poulet dans un plat.', duration: 5 },
      { id: 4, instruction: 'Rôtir au four pendant 45-50 minutes, en arrosant toutes les 15 minutes.', duration: 50 },
      { id: 5, instruction: 'Vérifier la cuisson (le jus doit être clair). Laisser reposer 10 minutes.', duration: 10 },
      { id: 6, instruction: 'Servir avec les légumes rôtis et un peu de jus de cuisson.', duration: 5 },
    ]
  },
  {
    id: 'dinner-3',
    day: 'Mardi',
    dayShort: 'Mar.',
    title: 'Risotto Crémeux aux Champignons Sauvages',
    description: 'Riz Arborio crémeux aux champignons de saison et parmesan, un classique italien réconfortant.',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop',
    protein: 18,
    calories: 450,
    type: 'dinner',
    tags: ['Italien', 'Végétarien', 'Crémeux'],
    ingredients: [
      { id: '1', name: 'Riz Arborio', quantity: '300', unit: 'g', checked: false, price: 4.50 },
      { id: '2', name: 'Champignons de Paris', quantity: '250', unit: 'g', checked: false, price: 3.00 },
      { id: '3', name: 'Bouillon de légumes', quantity: '1', unit: 'litre', checked: false, price: 1.50 },
      { id: '4', name: 'Parmesan râpé', quantity: '50', unit: 'g', checked: false, price: 3.50 },
      { id: '5', name: 'Vin blanc sec', quantity: '100', unit: 'ml', checked: false, price: 2.00 },
    ],
    steps: [
      { id: 1, instruction: 'Faire revenir les champignons dans un peu d\'huile jusqu\'à ce qu\'ils rendent leur eau.', duration: 8 },
      { id: 2, instruction: 'Ajouter le riz et le faire torréfier 2 minutes. Déglacer au vin blanc.', duration: 5 },
      { id: 3, instruction: 'Verser le bouillon chaud louche par louche, en remuant constamment.', duration: 18 },
      { id: 4, instruction: 'Cuire jusqu\'à ce que le riz soit crémeux et al dente (environ 18-20 minutes).', duration: 2 },
      { id: 5, instruction: 'Hors du feu, incorporer le parmesan et une noisette de beurre.', duration: 3 },
      { id: 6, instruction: 'Laisser reposer 2 minutes, servir avec du parmesan supplémentaire.', duration: 5 },
    ]
  },
  {
    id: 'dinner-4',
    day: 'Mercredi',
    dayShort: 'Mer.',
    title: 'Pavé de Saumon Grillé au Citron et Aneth',
    description: 'Pavé de saumon grillé avec une sauce au citron frais et aneth, accompagné de légumes vapeur.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    protein: 38,
    calories: 350,
    type: 'dinner',
    tags: ['Poisson', 'Léger', 'Rapide'],
    ingredients: [
      { id: '1', name: 'Pavé de saumon', quantity: '200', unit: 'g', checked: false, price: 9.00 },
      { id: '2', name: 'Citron', quantity: '1', unit: 'fruit', checked: false, price: 0.80 },
      { id: '3', name: 'Aneth frais', quantity: '1', unit: 'botte', checked: false, price: 1.50 },
      { id: '4', name: 'Brocolis', quantity: '200', unit: 'g', checked: false, price: 2.00 },
      { id: '5', name: 'Asperges vertes', quantity: '150', unit: 'g', checked: false, price: 3.50 },
    ],
    steps: [
      { id: 1, instruction: 'Préparer la sauce : mélanger le jus de citron, l\'aneth ciselé, sel et poivre.', duration: 3 },
      { id: 2, instruction: 'Cuire les légumes à la vapeur 8-10 minutes jusqu\'à ce qu\'ils soient tendres.', duration: 10 },
      { id: 3, instruction: 'Chauffer une poêle antiadhésive à feu vif. Badigeonner le saumon d\'huile.', duration: 2 },
      { id: 4, instruction: 'Assaisonner le saumon de sel et poivre. Cuire 4-5 minutes de chaque côté.', duration: 9 },
      { id: 5, instruction: 'Vérifier la cuisson (la chair doit être opaque mais encore juteuse).', duration: 1 },
      { id: 6, instruction: 'Servir le saumon avec la sauce au citron et les légumes vapeur.', duration: 3 },
    ]
  },
  {
    id: 'dinner-5',
    day: 'Jeudi',
    dayShort: 'Jeu.',
    title: 'Curry de Légumes au Lait de Coco et Cardamome',
    description: 'Légumes mijotés dans un curry crémeux au lait de coco avec des épices chauffantes, servi avec du riz basmati.',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop',
    protein: 12,
    calories: 380,
    type: 'dinner',
    tags: ['Vegan', 'Épicé', 'Indien'],
    ingredients: [
      { id: '1', name: 'Lait de coco', quantity: '400', unit: 'ml', checked: false, price: 2.50 },
      { id: '2', name: 'Curry en poudre', quantity: '2', unit: 'c. à soupe', checked: false, price: 1.00 },
      { id: '3', name: 'Cardamome', quantity: '4', unit: 'gousses', checked: false, price: 2.00 },
      { id: '4', name: 'Courgettes', quantity: '2', unit: 'pièces', checked: false, price: 1.50 },
      { id: '5', name: 'Poivrons rouges', quantity: '2', unit: 'pièces', checked: false, price: 2.50 },
    ],
    steps: [
      { id: 1, instruction: 'Faire revenir les épices (curry, cardamome, gingembre) dans l\'huile jusqu\'au parfum.', duration: 3 },
      { id: 2, instruction: 'Ajouter les légumes coupés en dés et faire revenir 5 minutes.', duration: 7 },
      { id: 3, instruction: 'Verser le lait de coco et couvrir. Laisser mijoter 20 minutes à feu doux.', duration: 22 },
      { id: 4, instruction: 'Pendant ce temps, cuire le riz basmati selon les instructions du paquet.', duration: 15 },
      { id: 5, instruction: 'Ajuster l\'assaisonnement. Ajouter du jus de citron vert pour la fraîcheur.', duration: 2 },
      { id: 6, instruction: 'Servir chaud avec le riz, garni de coriandre fraîche et de cacahuètes.', duration: 4 },
    ]
  },
  {
    id: 'dinner-6',
    day: 'Vendredi',
    dayShort: 'Ven.',
    title: 'Steak de Thon en Croûte de Sésame et Sauce Teriyaki',
    description: 'Steak de thon frais enrobbé de graines de sésame, saisi rapidement et servi avec une sauce teriyaki maison.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    protein: 42,
    calories: 400,
    type: 'dinner',
    tags: ['Poisson', 'Japonais', 'Rapide'],
    ingredients: [
      { id: '1', name: 'Steak de thon frais', quantity: '200', unit: 'g', checked: false, price: 14.00 },
      { id: '2', name: 'Graines de sésame', quantity: '50', unit: 'g', checked: false, price: 2.50 },
      { id: '3', name: 'Sauce soja', quantity: '30', unit: 'ml', checked: false, price: 1.00 },
      { id: '4', name: 'Miel', quantity: '15', unit: 'ml', checked: false, price: 1.80 },
      { id: '5', name: 'Gingembre frais', quantity: '10', unit: 'g', checked: false, price: 0.80 },
    ],
    steps: [
      { id: 1, instruction: 'Préparer la sauce teriyaki : mélanger sauce soja, miel et gingembre.', duration: 2 },
      { id: 2, instruction: 'Enrober le thon de graines de sésame en appuyant bien pour qu\'elles adhèrent.', duration: 2 },
      { id: 3, instruction: 'Chauffer une poêle à feu très vif avec un filet d\'huile.', duration: 1 },
      { id: 4, instruction: 'Saisir le thon 30-45 secondes de chaque côté (intérieur doit être rosé).', duration: 2 },
      { id: 5, instruction: 'Laisser reposer 2 minutes puis couper en tranches épaisses.', duration: 4 },
      { id: 6, instruction: 'Servir avec la sauce teriyaki et des légumes sautés.', duration: 3 },
    ]
  },
  {
    id: 'dinner-7',
    day: 'Samedi',
    dayShort: 'Sam.',
    title: 'Tartare de Bœuf à la Française avec Câpres',
    description: 'Bœuf cru haché finement assaisonné à la française avec câpres, échalotes et jaune d\'œuf, servi avec frites.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    protein: 32,
    calories: 360,
    type: 'dinner',
    tags: ['Bœuf', 'Gourmet', 'Traditionnel'],
    ingredients: [
      { id: '1', name: 'Filet de bœuf', quantity: '200', unit: 'g', checked: false, price: 12.00 },
      { id: '2', name: 'Câpres', quantity: '1', unit: 'c. à soupe', checked: false, price: 1.50 },
      { id: '3', name: 'Échalotes', quantity: '2', unit: 'pièces', checked: false, price: 0.80 },
      { id: '4', name: 'Moutarde de Dijon', quantity: '1', unit: 'c. à café', checked: false, price: 0.50 },
      { id: '5', name: 'Jaunes d\'œufs', quantity: '2', unit: 'pièces', checked: false, price: 1.00 },
    ],
    steps: [
      { id: 1, instruction: 'Hacher le bœuf finement au couteau ou le faire hacher par le boucher.', duration: 10 },
      { id: 2, instruction: 'Ciseler les échalotes très finement et les mélanger aux câpres hachées.', duration: 3 },
      { id: 3, instruction: 'Dans un bol, mélanger le bœuf avec les échalotes, câpres, moutarde, sel et poivre.', duration: 4 },
      { id: 4, instruction: 'Former une belle forme et créer un puits au centre pour le jaune d\'œuf.', duration: 2 },
      { id: 5, instruction: 'Servir immédiatement avec des frites maison, du pain grillé et une salade verte.', duration: 3 },
      { id: 6, instruction: 'Accompagner d\'un vin rouge léger et jeune (Beaujolais ou Chinon).', duration: 1 },
    ]
  },
];

// Generate 14 meals (7 lunch + 7 dinner)
export const baseLunches: Meal[] = weeklyMeals.map((meal, index) => ({
  ...meal,
  id: `lunch-${index}`,
  type: 'lunch' as const,
  isToday: index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6),
}));

// Use different dinner meals
export const baseDinners: Meal[] = dinnerMeals.map((meal, index) => ({
  ...meal,
  isToday: index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6),
}));

// Combined 14 meals for display
export const allMeals: Meal[] = [...baseLunches, ...baseDinners];

// Inspiration recipes
export const inspirationRecipes: InspirationRecipe[] = [
  {
    id: 'i1',
    title: 'Quinoa Supreme Salad',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    tag: 'Gourmet',
    time: 15,
    calories: 540,
  },
  {
    id: 'i2',
    title: 'Greek Power Bowl',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    tag: 'Healthy',
    time: 10,
    calories: 420,
  },
  {
    id: 'i3',
    title: 'Pad Thaï Spécial Mindlife',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    tag: 'World',
    time: 25,
    calories: 710,
  },
  {
    id: 'i4',
    title: 'Millet & Grilled Tofu',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    tag: 'Vegan',
    time: 20,
    calories: 380,
  },
];

// Default shopping list
export const defaultShoppingList = [
  { category: 'Produits Frais', count: 14, price: 112.40 },
  { category: 'Épicerie Bio', count: 8, price: 44.15 },
];

// Default budget
export const defaultBudget = { total: 215, remaining: 142.50 };

// Default prep time
export const defaultPrepTime = { total: 4.5, saved: 1.2 };
