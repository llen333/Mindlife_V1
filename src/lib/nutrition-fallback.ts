/**
 * Nutrition Fallback - Génération de repas et conseils nutritionnels
 * Sans API externe, basé sur des règles et templates
 */

// ============================================
// DONNÉES ALIMENTAIRES
// ============================================

interface Ingredient {
  name: string;
  quantity: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  name: string;
  description: string;
  ingredients: Ingredient[];
  preparation: string[];
  prepTime: string;
  cookTime: string;
  calories: number;
  protein: number;
  tags: string[];
}

interface MealPlan {
  mealType: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';
  meals: Meal[];
}

// REPAS PAR TYPE

export const BREAKFAST_MEALS: Meal[] = [
  {
    name: "Bowl de Smoothie Açaï",
    description: "Un bol énergisant et antioxydant pour bien commencer la journée",
    ingredients: [
      { name: "Purée d'açaï", quantity: "100g" },
      { name: "Banane", quantity: "1" },
      { name: "Myrtilles", quantity: "50g" },
      { name: "Granola", quantity: "30g" },
      { name: "Miel", quantity: "1 c.à.s" },
    ],
    preparation: [
      "Mixer l'açaï avec la moitié de la banane",
      "Verser dans un bol",
      "Disposer les tranches de banane restantes, les myrtilles et le granola",
      "Arroser de miel"
    ],
    prepTime: "5 min",
    cookTime: "0 min",
    calories: 350,
    protein: 8,
    tags: ["végétarien", "énergisant", "rapide"],
  },
  {
    name: "Œufs Brouillés aux Légumes",
    description: "Un petit-déjeuner protéiné et rassasiant",
    ingredients: [
      { name: "Œufs", quantity: "3" },
      { name: "Épinards frais", quantity: "50g" },
      { name: "Tomates cerises", quantity: "6" },
      { name: "Huile d'olive", quantity: "1 c.à.c" },
      { name: "Sel, poivre", quantity: "selon goût" },
    ],
    preparation: [
      "Faire chauffer l'huile dans une poêle",
      "Ajouter les épinards et les tomates, faire revenir 2 min",
      "Battre les œufs et les verser dans la poêle",
      "Remuer doucement jusqu'à cuisson souhaitée",
      "Assaisonner et servir"
    ],
    prepTime: "5 min",
    cookTime: "5 min",
    calories: 280,
    protein: 20,
    tags: ["protéiné", "sans gluten", "keto-friendly"],
  },
  {
    name: "Porridge Aux Pommes Cannelle",
    description: "Un classique réconfortant et énergétique",
    ingredients: [
      { name: "Flocons d'avoine", quantity: "50g" },
      { name: "Lait (ou lait végétal)", quantity: "200ml" },
      { name: "Pomme", quantity: "1" },
      { name: "Cannelle", quantity: "1 c.à.c" },
      { name: "Miel ou sirop d'érable", quantity: "1 c.à.s" },
    ],
    preparation: [
      "Faire chauffer le lait avec la cannelle",
      "Ajouter les flocons d'avoine, remuer constamment",
      "Cuire 5 min jusqu'à obtenir la consistance voulue",
      "Servir avec les dés de pomme et le miel"
    ],
    prepTime: "2 min",
    cookTime: "5 min",
    calories: 320,
    protein: 10,
    tags: ["végétarien", "réconfortant", "énergisant"],
  },
  {
    name: "Toast Avocat & Œuf Poché",
    description: "Le classique Instagram, nutritif et photogénique",
    ingredients: [
      { name: "Pain complet", quantity: "2 tranches" },
      { name: "Avocat mûr", quantity: "1" },
      { name: "Œuf", quantity: "2" },
      { name: "Jus de citron", quantity: "1 c.à.c" },
      { name: "Flocons de piment", quantity: "pincée" },
    ],
    preparation: [
      "Faire griller le pain",
      "Écraser l'avocat avec le citron, sel, poivre",
      "Pocher les œufs dans l'eau frémissante vinaigrée",
      "Tartiner le pain d'avocat, déposer les œufs",
      "Saupoudrer de flocons de piment"
    ],
    prepTime: "5 min",
    cookTime: "5 min",
    calories: 420,
    protein: 18,
    tags: ["protéiné", "tendance", "équilibré"],
  },
];

export const LUNCH_MEALS: Meal[] = [
  {
    name: "Buddha Bowl Quinoa & Poulet",
    description: "Un bol complet et équilibré",
    ingredients: [
      { name: "Quinoa cuit", quantity: "150g" },
      { name: "Blanc de poulet", quantity: "120g" },
      { name: "Avocat", quantity: "1/2" },
      { name: "Pois chiches", quantity: "50g" },
      { name: "Épinards frais", quantity: "30g" },
      { name: "Sauce tahini", quantity: "2 c.à.s" },
    ],
    preparation: [
      "Cuire le quinoa et le poulet grillé",
      "Disposer le quinoa dans un bol",
      "Ajouter le poulet tranché, l'avocat, les pois chiches",
      "Garnir d'épinards et napper de sauce tahini"
    ],
    prepTime: "10 min",
    cookTime: "15 min",
    calories: 520,
    protein: 35,
    tags: ["protéiné", "équilibré", "meal-prep"],
  },
  {
    name: "Salade César Allégée",
    description: "Le classique revisité plus léger",
    ingredients: [
      { name: "Romaine", quantity: "1 tête" },
      { name: "Blanc de poulet grillé", quantity: "150g" },
      { name: "Parmesan", quantity: "30g" },
      { name: "Croûtons maison", quantity: "30g" },
      { name: "Yaourt grec", quantity: "3 c.à.s" },
      { name: "Moutarde, ail, citron", quantity: "selon goût" },
    ],
    preparation: [
      "Griller le poulet assaisonné et le trancher",
      "Préparer la sauce avec yaourt, moutarde, ail et citron",
      "Déchirer la romaine, ajouter le poulet",
      "Parsemer de parmesan et croûtons",
      "Arroser de sauce"
    ],
    prepTime: "10 min",
    cookTime: "10 min",
    calories: 420,
    protein: 40,
    tags: ["protéiné", "salade", "classique"],
  },
  {
    name: "Wrap Végétarien",
    description: "Un déjeuner léger et portable",
    ingredients: [
      { name: "Tortilla complète", quantity: "1" },
      { name: "Houmous", quantity: "3 c.à.s" },
      { name: "Légumes grillés", quantity: "100g" },
      { name: "Feta", quantity: "40g" },
      { name: "Roquette", quantity: "30g" },
    ],
    preparation: [
      "Étaler le houmous sur la tortilla",
      "Disposer les légumes grillés",
      "Ajouter la feta émiettée et la roquette",
      "Rouler fermement et couper en deux"
    ],
    prepTime: "5 min",
    cookTime: "0 min",
    calories: 380,
    protein: 15,
    tags: ["végétarien", "rapide", "portable"],
  },
  {
    name: "Poke Bowl Saumon",
    description: "Hawaï venu à vous",
    ingredients: [
      { name: "Riz à sushi", quantity: "150g" },
      { name: "Saumon frais", quantity: "120g" },
      { name: "Avocat", quantity: "1/2" },
      { name: "Edamame", quantity: "50g" },
      { name: "Gingembre mariné", quantity: "20g" },
      { name: "Sauce soja, sésame", quantity: "2 c.à.s" },
    ],
    preparation: [
      "Couper le saumon en dés, mariner dans la sauce soja",
      "Disposer le riz dans un bol",
      "Arranger le saumon, l'avocat, les edamames",
      "Garnir de gingembre et graines de sésame"
    ],
    prepTime: "15 min",
    cookTime: "20 min (riz)",
    calories: 480,
    protein: 30,
    tags: ["poisson", "tendance", "oméga-3"],
  },
  {
    name: "Pasta Primavera Poulet",
    description: "Pâtes aux légumes de saison et poulet grillé",
    ingredients: [
      { name: "Pennes complets", quantity: "100g" },
      { name: "Blanc de poulet", quantity: "100g" },
      { name: "Courgettes", quantity: "1" },
      { name: "Poivrons", quantity: "1" },
      { name: "Tomates cerises", quantity: "10" },
      { name: "Parmesan", quantity: "20g" },
    ],
    preparation: [
      "Cuire les pâtes al dente",
      "Griller le poulet et le trancher",
      "Faire sauter les légumes à feu vif",
      "Mélanger le tout avec un filet d'huile d'olive",
      "Servir avec le parmesan"
    ],
    prepTime: "10 min",
    cookTime: "15 min",
    calories: 450,
    protein: 32,
    tags: ["protéiné", "italien", "équilibré"],
  },
  {
    name: "Salade Niçoise",
    description: "La salade emblématique de la Côte d'Azur",
    ingredients: [
      { name: "Thon en conserve", quantity: "120g" },
      { name: "Œufs", quantity: "2" },
      { name: "Haricots verts", quantity: "100g" },
      { name: "Olives noires", quantity: "30g" },
      { name: "Tomates", quantity: "2" },
      { name: "Anchois, câpres", quantity: "selon goût" },
    ],
    preparation: [
      "Cuire les œufs durs et les haricots verts",
      "Disposer les légumes dans l'assiette",
      "Émietter le thon au centre",
      "Décorer avec les œufs, olives et anchois",
      "Assaisonner d'huile d'olive"
    ],
    prepTime: "15 min",
    cookTime: "10 min",
    calories: 380,
    protein: 35,
    tags: ["protéiné", "méditerranéen", "classique"],
  },
  {
    name: "Burrito Bowl Mexicain",
    description: "Toutes les saveurs du Mexique dans un bol",
    ingredients: [
      { name: "Riz complet", quantity: "150g" },
      { name: "Bœuf haché maigre", quantity: "100g" },
      { name: "Haricots rouges", quantity: "80g" },
      { name: "Maïs", quantity: "50g" },
      { name: "Guacamole", quantity: "50g" },
      { name: "Salsa piquante", quantity: "2 c.à.s" },
    ],
    preparation: [
      "Cuire le riz à la mexicaine avec des épices",
      "Faire revenir le bœuf avec cumin et paprika",
      "Chauffer les haricots et le maïs",
      "Assembler le bowl avec tous les éléments",
      "Terminer avec guacamole et salsa"
    ],
    prepTime: "10 min",
    cookTime: "20 min",
    calories: 520,
    protein: 30,
    tags: ["protéiné", "mexicain", "épicé"],
  },
  // === NOUVEAUX REPAS (ajoutés pour éviter les répétitions) ===
  {
    name: "Salade Grecque au Poulet",
    description: "Les saveurs méditerranéennes dans une salade fraîche",
    ingredients: [
      { name: "Blanc de poulet grillé", quantity: "120g" },
      { name: "Concombre", quantity: "1" },
      { name: "Tomates", quantity: "2" },
      { name: "Feta", quantity: "50g" },
      { name: "Olives noires", quantity: "30g" },
      { name: "Huile d'olive, origan", quantity: "selon goût" },
    ],
    preparation: [
      "Griller le poulet avec des herbes méditerranéennes",
      "Couper les légumes en gros dés",
      "Émietter la feta sur le dessus",
      "Ajouter les olives",
      "Assaisonner d'huile d'olive et d'origan"
    ],
    prepTime: "10 min",
    cookTime: "10 min",
    calories: 380,
    protein: 35,
    tags: ["protéiné", "méditerranéen", "frais"],
  },
  {
    name: "Banh Mi Vietnamien",
    description: "Sandwich vietnamien croustillant et savoureux",
    ingredients: [
      { name: "Baguette", quantity: "1" },
      { name: "Porc grillé", quantity: "100g" },
      { name: "Carottes râpées", quantity: "50g" },
      { name: "Concombre", quantity: "1/4" },
      { name: "Coriandre", quantity: "quelques branches" },
      { name: "Sauce piment douce", quantity: "2 c.à.s" },
    ],
    preparation: [
      "Griller le porc avec de la sauce soja et du miel",
      "Faire mariner les carottes dans du vinaigre",
      "Toaster la baguette",
      "Garnir avec le porc, les légumes et la coriandre",
      "Arroser de sauce piment douce"
    ],
    prepTime: "15 min",
    cookTime: "10 min",
    calories: 420,
    protein: 25,
    tags: ["asiatique", "sandwich", "original"],
  },
  {
    name: "Quiche Lorraine Légère",
    description: "Le classique français en version allégée",
    ingredients: [
      { name: "Pâte brisée", quantity: "1" },
      { name: "Lardons", quantity: "80g" },
      { name: "Œufs", quantity: "3" },
      { name: "Crème légère", quantity: "150ml" },
      { name: "Emmental râpé", quantity: "40g" },
      { name: "Muscade, sel, poivre", quantity: "selon goût" },
    ],
    preparation: [
      "Préchauffer le four à 180°C",
      "Étaler la pâte dans un moule, la piquer",
      "Faire revenir les lardons",
      "Battre œufs et crème, ajouter les lardons",
      "Verser sur la pâte, parsemer de fromage",
      "Cuire 35-40 min"
    ],
    prepTime: "15 min",
    cookTime: "40 min",
    calories: 350,
    protein: 18,
    tags: ["français", "classique", "réconfortant"],
  },
  {
    name: "Tartare de Bœuf",
    description: "Pour les amateurs de viande crue assaisonnée",
    ingredients: [
      { name: "Bœuf haché frais", quantity: "150g" },
      { name: "Jaune d'œuf", quantity: "1" },
      { name: "Câpres", quantity: "1 c.à.s" },
      { name: "Échalotes", quantity: "1" },
      { name: "Moutarde de Dijon", quantity: "1 c.à.c" },
      { name: "Sauce Worcestershire", quantity: "quelques gouttes" },
    ],
    preparation: [
      "Hacher finement le bœuf (demander au boucher)",
      "Ciseler les échalotes et les câpres",
      "Mélanger la viande avec les condiments",
      "Former un steak, déposer le jaune au centre",
      "Servir avec une salade verte"
    ],
    prepTime: "15 min",
    cookTime: "0 min",
    calories: 320,
    protein: 28,
    tags: ["protéiné", "français", "sans cuisson"],
  },
  {
    name: "Couscous Royal",
    description: "Un voyage en Afrique du Nord avec merguez et poulet",
    ingredients: [
      { name: "Semoule de couscous", quantity: "150g" },
      { name: "Merguez", quantity: "2" },
      { name: "Cuisses de poulet", quantity: "1" },
      { name: "Pois chiches", quantity: "100g" },
      { name: "Courgettes, carottes", quantity: "150g" },
      { name: "Harissa", quantity: "selon goût" },
    ],
    preparation: [
      "Préparer les légumes en ragoût avec des épices",
      "Cuire les merguez et le poulet séparément",
      "Gonfler la semoule à la vapeur",
      "Dresser la semoule, disposer les viandes",
      "Napper de légumes et de sauce"
    ],
    prepTime: "20 min",
    cookTime: "45 min",
    calories: 580,
    protein: 35,
    tags: ["nord-africain", "réconfortant", "complet"],
  },
  {
    name: "Pad Thaï aux Crevettes",
    description: "Le célèbre sauté de nouilles thaïlandaises",
    ingredients: [
      { name: "Nouilles de riz", quantity: "150g" },
      { name: "Crevettes", quantity: "150g" },
      { name: "Œufs", quantity: "2" },
      { name: "Germes de soja", quantity: "50g" },
      { name: "Cacahuètes", quantity: "30g" },
      { name: "Sauce tamarin, poisson", quantity: "3 c.à.s" },
    ],
    preparation: [
      "Tremper les nouilles dans l'eau tiède",
      "Saisir les crevettes, réserver",
      "Brouiller les œufs dans le wok",
      "Ajouter nouilles et sauces, sauter",
      "Incorporer crevettes, germes de soja",
      "Servir avec cacahuètes concassées"
    ],
    prepTime: "15 min",
    cookTime: "10 min",
    calories: 450,
    protein: 28,
    tags: ["thaï", "exotique", "nouilles"],
  },
  {
    name: "Poke Végétarien Tofu",
    description: "Bowl hawaïen version plant-based",
    ingredients: [
      { name: "Riz à sushi", quantity: "150g" },
      { name: "Tofu ferme", quantity: "150g" },
      { name: "Avocat", quantity: "1" },
      { name: "Mangue", quantity: "1/2" },
      { name: "Edamame", quantity: "50g" },
      { name: "Sauce teriyaki", quantity: "2 c.à.s" },
    ],
    preparation: [
      "Presser et couper le tofu en cubes",
      "Mariner le tofu dans la sauce teriyaki",
      "Cuire le riz à sushi",
      "Disposer le riz dans un bol",
      "Arranger tofu, avocat, mangue et edamame",
      "Arroser de sauce restante"
    ],
    prepTime: "15 min",
    cookTime: "20 min",
    calories: 380,
    protein: 20,
    tags: ["végétarien", "hawaïen", "sain"],
  },
];

export const DINNER_MEALS: Meal[] = [
  {
    name: "Saumon Grillé & Légumes Rôtis",
    description: "Un dîner sain et satisfaisant",
    ingredients: [
      { name: "Pavé de saumon", quantity: "180g" },
      { name: "Brocolis", quantity: "150g" },
      { name: "Patate douce", quantity: "1 moyenne" },
      { name: "Huile d'olive", quantity: "2 c.à.s" },
      { name: "Ail, herbes", quantity: "selon goût" },
    ],
    preparation: [
      "Préchauffer le four à 200°C",
      "Couper la patate douce en quartiers, les brocolis en fleurettes",
      "Assaisonner les légumes, enfourner 20 min",
      "Griller le saumon à la poêle 4 min de chaque côté",
      "Servir ensemble"
    ],
    prepTime: "10 min",
    cookTime: "25 min",
    calories: 480,
    protein: 35,
    tags: ["poisson", "oméga-3", "sans gluten"],
  },
  {
    name: "Poulet Rôti & Ratatouille",
    description: "Classique français, réconfort garanti",
    ingredients: [
      { name: "Cuisses de poulet", quantity: "2" },
      { name: "Courgettes", quantity: "2" },
      { name: "Aubergines", quantity: "1" },
      { name: "Poivrons", quantity: "2" },
      { name: "Tomates concassées", quantity: "400g" },
      { name: "Herbes de Provence", quantity: "2 c.à.c" },
    ],
    preparation: [
      "Rôtir le poulet au four 40 min à 180°C",
      "Couper les légumes en dés",
      "Faire revenir les légumes, ajouter les tomates",
      "Laisser mijoter 25 min avec les herbes",
      "Servir le poulet sur la ratatouille"
    ],
    prepTime: "15 min",
    cookTime: "45 min",
    calories: 520,
    protein: 40,
    tags: ["protéiné", "réconfortant", "classique"],
  },
  {
    name: "Curry de Légumes au Lait de Coco",
    description: "Voyage en Asie, version végétarienne",
    ingredients: [
      { name: "Lait de coco", quantity: "400ml" },
      { name: "Pois chiches", quantity: "200g" },
      { name: "Épinards", quantity: "100g" },
      { name: "Tomates", quantity: "2" },
      { name: "Oignon, ail, gingembre", quantity: "selon goût" },
      { name: "Poudre de curry", quantity: "2 c.à.s" },
    ],
    preparation: [
      "Faire revenir oignon, ail et gingembre",
      "Ajouter le curry, puis les tomates",
      "Verser le lait de coco et les pois chiches",
      "Laisser mijoter 15 min",
      "Ajouter les épinards en fin de cuisson",
      "Servir avec du riz basmati"
    ],
    prepTime: "10 min",
    cookTime: "20 min",
    calories: 380,
    protein: 15,
    tags: ["végétarien", "exotique", "crémeux"],
  },
  {
    name: "Steak & Frites de Patate Douce",
    description: "Bistrot à la maison",
    ingredients: [
      { name: "Steak (bavette ou faux-filet)", quantity: "200g" },
      { name: "Patates douces", quantity: "2" },
      { name: "Beurre", quantity: "30g" },
      { name: "Ail", quantity: "2 gousses" },
      { name: "Persil", quantity: "1 c.à.s" },
    ],
    preparation: [
      "Couper les patates en frites, les mélanger à l'huile",
      "Enfourner 25 min à 220°C",
      "Sortir la viande du frigo 30 min avant",
      "Cuire le steak 3-4 min de chaque côté",
      "Préparer le beurre maître d'hôtel",
      "Servir le steak nappé de beurre avec les frites"
    ],
    prepTime: "10 min",
    cookTime: "25 min",
    calories: 580,
    protein: 45,
    tags: ["protéiné", "réconfortant", "bistrot"],
  },
  {
    name: "Risotto aux Champignons",
    description: "Crémeux et réconfortant à l'italienne",
    ingredients: [
      { name: "Riz Arborio", quantity: "180g" },
      { name: "Champignons de Paris", quantity: "200g" },
      { name: "Parmesan râpé", quantity: "50g" },
      { name: "Vin blanc", quantity: "100ml" },
      { name: "Bouillon de légumes", quantity: "700ml" },
      { name: "Échalotes, beurre", quantity: "selon goût" },
    ],
    preparation: [
      "Faire revenir les champignons et les réserver",
      "Faire suer les échalotes, ajouter le riz",
      "Déglacer au vin blanc",
      "Ajouter le bouillon louche par louche",
      "Incorporer champignons et parmesan en fin de cuisson"
    ],
    prepTime: "10 min",
    cookTime: "25 min",
    calories: 450,
    protein: 15,
    tags: ["végétarien", "italien", "réconfortant"],
  },
  {
    name: "Pavé de Thon aux Sésames",
    description: "Thon rouge en croûte, cuisson parfaite",
    ingredients: [
      { name: "Pavé de thon frais", quantity: "180g" },
      { name: "Graines de sésame", quantity: "3 c.à.s" },
      { name: "Sauce soja", quantity: "2 c.à.s" },
      { name: "Gingembre frais", quantity: "20g" },
      { name: "Wakame", quantity: "30g" },
      { name: "Riz à sushi", quantity: "100g" },
    ],
    preparation: [
      "Mariner le thon dans la sauce soja",
      "Enrober de graines de sésame",
      "Saisir 30 secondes de chaque côté dans une poêle très chaude",
      "Servir tranché avec le riz et les wakames",
      "Accompagner de gingembre mariné"
    ],
    prepTime: "10 min",
    cookTime: "15 min",
    calories: 380,
    protein: 40,
    tags: ["poisson", "japonais", "léger"],
  },
  {
    name: "Wok de Bœuf aux Légumes",
    description: "Sauté rapide et savoureux façon asiatique",
    ingredients: [
      { name: "Faux-filet de bœuf", quantity: "150g" },
      { name: "Nouilles chinoises", quantity: "100g" },
      { name: "Pois mangetout", quantity: "80g" },
      { name: "Carottes", quantity: "1" },
      { name: "Poivron rouge", quantity: "1" },
      { name: "Sauce soja, huître", quantity: "3 c.à.s" },
    ],
    preparation: [
      "Couper le bœuf en fines lamelles, le mariner",
      "Préparer les légumes en julienne",
      "Cuire les nouilles et les égoutter",
      "Faire sauter le bœuf à feu vif, réserver",
      "Sauter les légumes, ajouter nouilles et bœuf",
      "Terminer avec la sauce"
    ],
    prepTime: "15 min",
    cookTime: "10 min",
    calories: 480,
    protein: 35,
    tags: ["protéiné", "asiatique", "rapide"],
  },
  // === NOUVEAUX REPAS DÎNER (ajoutés pour éviter les répétitions) ===
  {
    name: "Chili Con Carne Maison",
    description: "Un classique tex-mex réconfortant et épicé",
    ingredients: [
      { name: "Bœuf haché", quantity: "200g" },
      { name: "Haricots rouges", quantity: "200g" },
      { name: "Tomates concassées", quantity: "400g" },
      { name: "Maïs", quantity: "100g" },
      { name: "Oignon, ail, poivron", quantity: "selon goût" },
      { name: "Cumin, piment, paprika", quantity: "2 c.à.c" },
    ],
    preparation: [
      "Faire revenir oignon, ail et poivron",
      "Ajouter le bœuf et le faire dorer",
      "Incorporer les épices, puis les tomates",
      "Laisser mijoter 30 min",
      "Ajouter les haricots et le maïs",
      "Servir avec du riz ou du pain"
    ],
    prepTime: "15 min",
    cookTime: "45 min",
    calories: 480,
    protein: 32,
    tags: ["protéiné", "tex-mex", "réconfortant"],
  },
  {
    name: "Poulet Tandoori",
    description: "Poulet indien aux épices parfumées",
    ingredients: [
      { name: "Cuisses de poulet", quantity: "2" },
      { name: "Yaourt nature", quantity: "150g" },
      { name: "Poudre tandoori", quantity: "2 c.à.s" },
      { name: "Gingembre, ail", quantity: "selon goût" },
      { name: "Riz basmati", quantity: "150g" },
      { name: "Concombre, menthe", quantity: "pour raita" },
    ],
    preparation: [
      "Mariner le poulet dans yaourt et épices (2h min)",
      "Préchauffer le four à 200°C",
      "Cuire le poulet 35-40 min au four",
      "Préparer le riz basmati",
      "Faire une raita avec concombre et menthe",
      "Servir le poulet avec riz et raita"
    ],
    prepTime: "15 min (+ mariner)",
    cookTime: "40 min",
    calories: 420,
    protein: 38,
    tags: ["indien", "épicé", "protéiné"],
  },
  {
    name: "Gratin Dauphinois",
    description: "Pommes de terre crémeuses à la française",
    ingredients: [
      { name: "Pommes de terre", quantity: "1kg" },
      { name: "Crème fraîche", quantity: "400ml" },
      { name: "Lait", quantity: "200ml" },
      { name: "Ail", quantity: "2 gousses" },
      { name: "Muscade", quantity: "pincée" },
      { name: "Beurre, gruyère", quantity: "pour gratiner" },
    ],
    preparation: [
      "Émincer les pommes de terre finement",
      "Frotter le plat d'ail, beurrer",
      "Disposer les pommes de terre en couches",
      "Mélanger crème, lait, ail et muscade",
      "Verser sur les pommes de terre",
      "Cuire 1h à 180°C, gratiner à la fin"
    ],
    prepTime: "20 min",
    cookTime: "1h",
    calories: 380,
    protein: 8,
    tags: ["français", "végétarien", "réconfortant"],
  },
  {
    name: "Tartiflette",
    description: "Le plat savoyard par excellence",
    ingredients: [
      { name: "Pommes de terre", quantity: "1kg" },
      { name: "Reblochon", quantity: "1" },
      { name: "Lardons", quantity: "150g" },
      { name: "Oignons", quantity: "2" },
      { name: "Crème fraîche", quantity: "200ml" },
      { name: "Vin blanc", quantity: "100ml" },
    ],
    preparation: [
      "Cuire les pommes de terre à l'eau",
      "Faire revenir lardons et oignons",
      "Déglacer au vin blanc",
      "Couper les pommes de terre en rondelles",
      "Disposer en couches avec crème et lardons",
      "Couper le reblochon en deux, poser dessus",
      "Cuire 30 min à 200°C"
    ],
    prepTime: "20 min",
    cookTime: "30 min",
    calories: 650,
    protein: 28,
    tags: ["français", "hiver", "réconfortant"],
  },
  {
    name: "Cassoulet Express",
    description: "Version rapide du célèbre plat du Sud-Ouest",
    ingredients: [
      { name: "Saucisses de Toulouse", quantity: "4" },
      { name: "Haricots blancs en conserve", quantity: "400g" },
      { name: "Confit de canard", quantity: "2 cuisses" },
      { name: "Tomates concassées", quantity: "200g" },
      { name: "Oignon, carottes", quantity: "selon goût" },
      { name: "Herbes de Provence", quantity: "1 c.à.s" },
    ],
    preparation: [
      "Faire revenir saucisses et légumes",
      "Ajouter les tomates et les herbes",
      "Incorporer les haricots rincés",
      "Laisser mijoter 30 min",
      "Ajouter le confit en fin de cuisson",
      "Servir bien chaud"
    ],
    prepTime: "15 min",
    cookTime: "45 min",
    calories: 680,
    protein: 42,
    tags: ["français", "sud-ouest", "hiver"],
  },
  {
    name: "Moules Marinières & Frites",
    description: "Le classique belge à la maison",
    ingredients: [
      { name: "Moules fraîches", quantity: "1kg" },
      { name: "Vin blanc", quantity: "200ml" },
      { name: "Échalotes", quantity: "3" },
      { name: "Persil", quantity: "1 bouquet" },
      { name: "Crème fraîche", quantity: "100ml" },
      { name: "Pommes de terre", quantity: "pour frites" },
    ],
    preparation: [
      "Gratter et laver les moules",
      "Faire suer les échalotes au beurre",
      "Déglacer au vin blanc",
      "Ajouter les moules, couvrir 5 min",
      "Incorporer la crème et le persil",
      "Servir avec des frites maison"
    ],
    prepTime: "20 min",
    cookTime: "15 min",
    calories: 520,
    protein: 28,
    tags: ["fruits de mer", "belge", "classique"],
  },
  {
    name: "Aiguillettes de Canard aux Pommes",
    description: "Canard sucré-salé aux pommes caramélisées",
    ingredients: [
      { name: "Magret de canard", quantity: "1" },
      { name: "Pommes", quantity: "2" },
      { name: "Miel", quantity: "2 c.à.s" },
      { name: "Vinaigre balsamique", quantity: "1 c.à.s" },
      { name: "Thym frais", quantity: "quelques branches" },
      { name: "Pommes de terre", quantity: "pour accompagnement" },
    ],
    preparation: [
      "Inciser le gras du magret en losanges",
      "Saisir le magret côté gras 8 min",
      "Retirer, couper en aiguillettes",
      "Caraméliser les pommes dans le gras",
      "Ajouter miel et vinaigre",
      "Servir avec purée ou pommes rôties"
    ],
    prepTime: "15 min",
    cookTime: "20 min",
    calories: 480,
    protein: 35,
    tags: ["canard", "français", "élégant"],
  },
];

export const SNACK_MEALS: Meal[] = [
  {
    name: "Energy Balls",
    description: "Boules d'énergie sans cuisson",
    ingredients: [
      { name: "Dattes Medjool", quantity: "10" },
      { name: "Amandes", quantity: "50g" },
      { name: "Flocons d'avoine", quantity: "30g" },
      { name: "Cacao en poudre", quantity: "1 c.à.s" },
      { name: "Beurre de cacahuète", quantity: "1 c.à.s" },
    ],
    preparation: [
      "Mixer les dattes et les amandes",
      "Ajouter les autres ingrédients, mixer encore",
      "Former des boules avec les mains humides",
      "Réfrigérer 30 min"
    ],
    prepTime: "10 min",
    cookTime: "0 min",
    calories: 85,
    protein: 3,
    tags: ["végétarien", "sans cuisson", "énergie"],
  },
  {
    name: "Yogurt Parfait",
    description: "Snack protéiné et gourmand",
    ingredients: [
      { name: "Yaourt grec", quantity: "150g" },
      { name: "Fruits rouges", quantity: "50g" },
      { name: "Granola", quantity: "20g" },
      { name: "Miel", quantity: "1 c.à.c" },
    ],
    preparation: [
      "Verser le yaourt dans un verre",
      "Ajouter les fruits rouges",
      "Parsemer de granola",
      "Arroser de miel"
    ],
    prepTime: "2 min",
    cookTime: "0 min",
    calories: 220,
    protein: 15,
    tags: ["protéiné", "rapide", "gourmand"],
  },
  {
    name: "Houmous & Crudités",
    description: "Classique méditerranéen",
    ingredients: [
      { name: "Pois chiches en conserve", quantity: "200g" },
      { name: "Tahini", quantity: "2 c.à.s" },
      { name: "Citron, ail", quantity: "selon goût" },
      { name: "Carottes, concombre", quantity: "pour tremper" },
    ],
    preparation: [
      "Mixer pois chiches, tahini, citron et ail",
      "Ajouter de l'eau pour la consistance",
      "Servir avec les crudités coupées en bâtonnets"
    ],
    prepTime: "5 min",
    cookTime: "0 min",
    calories: 180,
    protein: 8,
    tags: ["végétarien", "rapide", "protéine végétale"],
  },
];

// ============================================
// GÉNÉRATEURS
// ============================================

export function generateMeal(mealType: string): MealPlan {
  let meals: Meal[];
  
  switch (mealType.toLowerCase()) {
    case 'petit_dejeuner':
    case 'petit-déjeuner':
    case 'breakfast':
      meals = BREAKFAST_MEALS;
      break;
    case 'dejeuner':
    case 'déjeuner':
    case 'lunch':
      meals = LUNCH_MEALS;
      break;
    case 'diner':
    case 'dîner':
    case 'dinner':
      meals = DINNER_MEALS;
      break;
    case 'collation':
    case 'snack':
      meals = SNACK_MEALS;
      break;
    default:
      meals = LUNCH_MEALS;
  }
  
  const typeMap: Record<string, 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation'> = {
    'petit_dejeuner': 'petit_dejeuner',
    'petit-déjeuner': 'petit_dejeuner',
    'breakfast': 'petit_dejeuner',
    'dejeuner': 'dejeuner',
    'déjeuner': 'dejeuner',
    'lunch': 'dejeuner',
    'diner': 'diner',
    'dîner': 'diner',
    'dinner': 'diner',
    'collation': 'collation',
    'snack': 'collation',
  };
  
  return {
    mealType: typeMap[mealType.toLowerCase()] || 'dejeuner',
    meals: meals,
  };
}

export function getRandomMeal(mealType: string): Meal {
  const plan = generateMeal(mealType);
  return plan.meals[Math.floor(Math.random() * plan.meals.length)];
}

export function generateDayMenu(): Record<string, Meal> {
  return {
    petit_dejeuner: getRandomMeal('petit_dejeuner'),
    dejeuner: getRandomMeal('dejeuner'),
    diner: getRandomMeal('diner'),
    collation: getRandomMeal('collation'),
  };
}

export function generateWeekMenu(): Record<string, Record<string, Meal>> {
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const menu: Record<string, Record<string, Meal>> = {};
  
  for (const day of days) {
    menu[day] = generateDayMenu();
  }
  
  return menu;
}

// ============================================
// CONSEILS NUTRITIONNELS
// ============================================

const NUTRITION_TIPS = [
  {
    topic: 'hydratation',
    tips: [
      "Bois au moins 1,5L d'eau par jour. Ton corps en a besoin pour fonctionner optimalement.",
      "Commence ta journée par un grand verre d'eau tiède avec du citron.",
      "Si tu as faim, bois d'abord de l'eau. La déshydratation imite la faim.",
    ],
  },
  {
    topic: 'protéines',
    tips: [
      "Vise 1,6 à 2g de protéines par kg de poids corporel si tu fais du sport.",
      "Les sources de protéines : viandes, poissons, œufs, légumineuses, produits laitiers.",
      "Répartis tes protéines sur tous les repas pour une meilleure absorption.",
    ],
  },
  {
    topic: 'energie',
    tips: [
      "Pour plus d'énergie, privilégie les glucides complexes : avoine, riz complet, patate douce.",
      "Évite les pics de glycémie en limitant le sucre raffiné.",
      "Un petit-déjeuner riche en protéines te donnera plus d'énergie stable.",
    ],
  },
  {
    topic: 'perte_poids',
    tips: [
      "Le déficit calorique est la clé : mange moins que tu ne dépenses.",
      "Privilégie les aliments volumineux mais peu caloriques : légumes, fruits.",
      "Mange lentement et écoute ta satiété.",
    ],
  },
  {
    topic: 'prise_masse',
    tips: [
      "Mange en surplus calorique modéré (+300-500 kcal).",
      "Les protéines sont essentielles : 2g/kg minimum.",
      "Ne néglige pas les glucides, ils alimentent tes entraînements.",
    ],
  },
  {
    topic: 'general',
    tips: [
      "Mange varié et coloré : chaque couleur apporte des nutriments différents.",
      "Prépare tes repas à l'avance pour éviter les mauvais choix.",
      "Le sommeil et la nutrition sont liés : dors bien pour bien manger.",
    ],
  },
];

export function getNutritionAdvice(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  
  for (const item of NUTRITION_TIPS) {
    if (lowerTopic.includes(item.topic) || item.topic.includes(lowerTopic)) {
      return item.tips[Math.floor(Math.random() * item.tips.length)];
    }
  }
  
  // General advice if topic not found
  const generalTips = NUTRITION_TIPS.find(t => t.topic === 'general')!.tips;
  return generalTips[Math.floor(Math.random() * generalTips.length)];
}

// ============================================
// GÉNÉRATION DE RECETTES
// ============================================

export function generateRecipe(ingredients: string[], type: string = 'plat'): Meal {
  // Recettes basées sur les ingrédients fournis
  const ingredientList = ingredients.slice(0, 5);
  
  const baseRecipes: Meal[] = [
    {
      name: "Sauté Rapide aux Légumes",
      description: "Une poêlée rapide avec ce que vous avez",
      ingredients: ingredientList.map(i => ({ name: i, quantity: "quantité souhaitée" })),
      preparation: [
        "Couper tous les ingrédients en morceaux",
        "Faire chauffer un filet d'huile dans une poêle",
        "Faire revenir les ingrédients les plus durs en premier",
        "Ajouter les autres et cuire 5-7 min",
        "Assaisonner selon votre goût",
      ],
      prepTime: "5 min",
      cookTime: "10 min",
      calories: 250,
      protein: 15,
      tags: ["rapide", "flexible", "équilibré"],
    },
  ];
  
  return baseRecipes[0];
}
