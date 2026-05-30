// Données statiques des repas pour le module Nutrition
import type { Meal, InspirationRecipe } from '../types/nutrition';

// Jours de la semaine en français
export const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const DAYS_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

// Images par défaut pour les repas
export const defaultImages = [
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
];

// Repas du déjeuner de la semaine
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
    description: 'Une salade fraîche et colorée aux saveurs de la Méditerranée, avec des légumes croquants et du fromage feta crémeux.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    protein: 28,
    calories: 480,
    type: 'dinner',
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
    type: 'dinner',
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
    type: 'dinner',
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

// Repas du dîner
export const dinnerMeals: Meal[] = [
  {
    id: 'dinner-1',
    day: 'Dimanche',
    dayShort: 'Dim.',
    title: 'Soupe de Poissons Méditerranéenne',
    description: 'Une soupe riche et parfumée aux saveurs du sud.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop',
    protein: 28,
    calories: 380,
    type: 'dinner',
    tags: ['Poisson', 'Léger'],
    ingredients: [
      { id: '1', name: 'Mélange de poissons', quantity: '300', unit: 'g', checked: false, price: 9.00 },
    ],
    steps: [
      { id: 1, instruction: 'Préparer le fumet de poisson.', duration: 20 },
      { id: 2, instruction: 'Ajouter les poissons et les légumes.', duration: 15 },
    ]
  },
  {
    id: 'dinner-2',
    day: 'Lundi',
    dayShort: 'Lun.',
    title: 'Poulet Rôti aux Herbes',
    description: 'Cuisses de poulet rôties avec des herbes de Provence.',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop',
    protein: 35,
    calories: 420,
    type: 'dinner',
    isToday: true,
    tags: ['Volaille', 'Traditionnel'],
    ingredients: [
      { id: '1', name: 'Cuisses de poulet', quantity: '2', unit: 'pièces', checked: false, price: 6.50 },
    ],
    steps: [
      { id: 1, instruction: 'Mariner le poulet avec les herbes.', duration: 30 },
      { id: 2, instruction: 'Rôtir au four à 180°C pendant 45 minutes.', duration: 45 },
    ]
  },
  {
    id: 'dinner-3',
    day: 'Mardi',
    dayShort: 'Mar.',
    title: 'Risotto aux Champignons',
    description: 'Riz crémeux aux champignons de saison et parmesan.',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop',
    protein: 18,
    calories: 450,
    type: 'dinner',
    tags: ['Italien', 'Végétarien'],
    ingredients: [
      { id: '1', name: 'Riz Arborio', quantity: '200', unit: 'g', checked: false, price: 3.50 },
    ],
    steps: [
      { id: 1, instruction: 'Faire revenir les champignons.', duration: 10 },
      { id: 2, instruction: 'Cuire le riz en ajoutant le bouillon progressivement.', duration: 25 },
    ]
  },
  {
    id: 'dinner-4',
    day: 'Mercredi',
    dayShort: 'Mer.',
    title: 'Saumon Grillé au Citron',
    description: 'Pavé de saumon grillé avec une sauce au citron et aneth.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    protein: 38,
    calories: 350,
    type: 'dinner',
    tags: ['Poisson', 'Léger'],
    ingredients: [
      { id: '1', name: 'Pavé de saumon', quantity: '180', unit: 'g', checked: false, price: 8.00 },
    ],
    steps: [
      { id: 1, instruction: 'Assaisonner le saumon.', duration: 5 },
      { id: 2, instruction: 'Griller 4 minutes de chaque côté.', duration: 8 },
    ]
  },
  {
    id: 'dinner-5',
    day: 'Jeudi',
    dayShort: 'Jeu.',
    title: 'Curry de Légumes au Lait de Coco',
    description: 'Légumes mijotés dans un curry crémeux au lait de coco.',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop',
    protein: 12,
    calories: 380,
    type: 'dinner',
    tags: ['Vegan', 'Épicé'],
    ingredients: [
      { id: '1', name: 'Lait de coco', quantity: '400', unit: 'ml', checked: false, price: 2.50 },
    ],
    steps: [
      { id: 1, instruction: 'Faire revenir les épices.', duration: 5 },
      { id: 2, instruction: 'Ajouter les légumes et le lait de coco.', duration: 20 },
    ]
  },
  {
    id: 'dinner-6',
    day: 'Vendredi',
    dayShort: 'Ven.',
    title: 'Steak de Thon Sésame',
    description: 'Steak de thon frais en croûte de sésame, sauté rapidement.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    protein: 42,
    calories: 400,
    type: 'dinner',
    tags: ['Poisson', 'Japonais'],
    ingredients: [
      { id: '1', name: 'Steak de thon frais', quantity: '200', unit: 'g', checked: false, price: 14.00 },
    ],
    steps: [
      { id: 1, instruction: 'Enrober le thon de graines de sésame.', duration: 5 },
      { id: 2, instruction: 'Saisir 1-2 minutes de chaque côté.', duration: 4 },
    ]
  },
  {
    id: 'dinner-7',
    day: 'Samedi',
    dayShort: 'Sam.',
    title: 'Tartare de Bœuf',
    description: 'Bœuf cru assaisonné à la française avec câpres et jaune d\'œuf.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    protein: 32,
    calories: 360,
    type: 'dinner',
    tags: ['Bœuf', 'Gourmet'],
    ingredients: [
      { id: '1', name: 'Filet de bœuf', quantity: '200', unit: 'g', checked: false, price: 12.00 },
    ],
    steps: [
      { id: 1, instruction: 'Hacher le bœuf finement.', duration: 10 },
      { id: 2, instruction: 'Assaisonner et servir avec un jaune d\'œuf.', duration: 5 },
    ]
  },
];

// Recettes d'inspiration
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

// Génère les repas combinés (14 repas: 7 déjeuners + 7 dîners)
export function generateAllMeals(): Meal[] {
  const baseLunches = weeklyMeals.map((meal, index) => ({
    ...meal,
    id: `lunch-${index}`,
    type: 'lunch' as const,
    isToday: index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6),
  }));

  const baseDinners = dinnerMeals.map((meal, index) => ({
    ...meal,
    isToday: index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6),
  }));

  return [...baseLunches, ...baseDinners];
}

// Export des repas combinés
export const allMeals = generateAllMeals();
