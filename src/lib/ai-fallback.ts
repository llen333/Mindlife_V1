/**
 * AI Fallback Module - Réponses intelligentes sans API externe
 * Analyse le contexte et génère des réponses adaptées
 */

// ============================================
// ANALYSE D'INTENTION
// ============================================

export type IntentType = 
  | 'question' 
  | 'problem' 
  | 'emotion' 
  | 'goal' 
  | 'advice' 
  | 'greeting'
  | 'gratitude'
  | 'frustration'
  | 'motivation'
  | 'reflection'
  | 'decision'
  | 'help'
  | 'direct_question'
  | 'general';

export interface AnalysisResult {
  intent: IntentType;
  topics: string[];
  emotion: 'positive' | 'negative' | 'neutral' | 'mixed';
  urgency: 'low' | 'medium' | 'high';
  keywords: string[];
}

const TOPIC_PATTERNS: Record<string, string[]> = {
  travail: ['travail', 'boulot', 'tâche', 'projet', 'réunion', 'colègue', 'patron', 'entreprise', 'carrière', 'job', 'professionnel'],
  stress: ['stress', 'anxieux', 'anxiété', 'angoisse', 'pression', 'tendu', 'nervous', 'panique'],
  fatigue: ['fatigué', 'épuisé', 'tired', 'sommeil', 'dormir', 'repos', 'énergie', 'crevé', 'crevée'],
  colere: ['colère', 'colere', 'énervé', 'enerve', 'rage', 'furieux', 'pété', 'enervant'],
  relations: ['relation', 'amis', 'famille', 'couple', 'amour', 'parents', 'enfants', 'conflit', 'dispute', 'ami', 'copain', 'copine'],
  santé: ['santé', 'malade', 'douleur', 'médecin', 'corps', 'mal', 'symptôme'],
  argent: ['argent', 'finances', 'budget', 'dettes', 'économies', 'sous', 'fric'],
  temps: ['temps', 'organiser', 'planning', 'agenda', 'deadline', 'délai', 'retard'],
  confiance: ['confiance', 'estime', 'doute', 'peur', 'courage', 'valeur', 'complexé'],
  changement: ['changement', 'nouveau', 'décision', 'choix', 'avenir', 'transition'],
  philosophie: ['sens', 'vie', 'mort', 'but', 'existence', 'spirituel', 'âme', 'destin'],
  sport: ['sport', 'exercice', 'musculation', 'course', 'entraînement', 'fitness', 'gym'],
  alimentation: ['manger', 'alimentation', 'repas', 'régime', 'nutrition', 'cuisine'],
  solitude: ['seul', 'solitude', 'isolé', 'personne', 'rencontrer'],
  amour_propre: ['aime', 'aime pas', 'déteste', 'valoriser', 'respecter'],
};

const EMOTION_PATTERNS = {
  positive: ['heureux', 'content', 'joyeux', 'bien', 'super', 'génial', 'merci', 'gratitude', 'réussi', 'succès', 'fierté'],
  negative: ['triste', 'déprimé', 'énervé', 'colère', 'frustré', 'perdu', 'seul', 'mal', 'difficile', 'dur', 'problème', 'pire', 'peux plus', 'marre', 'ras'],
  mixed: ['mais', 'cependant', 'par contre', 'bizarre', 'mitigé', 'hésite'],
};

export function analyzeMessage(message: string): AnalysisResult {
  const lower = message.toLowerCase();
  const keywords = message.split(/\s+/).filter(w => w.length > 3);
  
  // Detect topics
  const topics: string[] = [];
  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
    if (patterns.some(p => lower.includes(p))) {
      topics.push(topic);
    }
  }
  
  // Detect emotion
  let emotion: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
  const hasPositive = EMOTION_PATTERNS.positive.some(p => lower.includes(p));
  const hasNegative = EMOTION_PATTERNS.negative.some(p => lower.includes(p));
  const hasMixed = EMOTION_PATTERNS.mixed.some(p => lower.includes(p));
  
  if (hasPositive && hasNegative) emotion = 'mixed';
  else if (hasPositive) emotion = 'positive';
  else if (hasNegative) emotion = 'negative';
  else if (hasMixed) emotion = 'mixed';
  
  // Detect intent - ordre important !
  let intent: IntentType = 'general';
  
  // Greeting
  if (/^(bonjour|salut|hello|hey|coucou|yo|wesh)/i.test(message.trim())) {
    intent = 'greeting';
  }
  // Help request (avant direct_question car souvent "aide moi" = vraie demande)
  else if (/aide(-moi)?|besoin d'aide|peux tu m'aider|pouvez vous m'aider|suggestion|conseil|comment faire|que (dois|puis) je/i.test(lower)) {
    intent = 'help';
  }
  // "je te pose une question", "réponds moi" - mais SANS contenu substantiel
  else if (/je te pose|réponds moi|reponds moi|dis moi|dit moi|parle moi|ecoute moi/i.test(lower) && message.split(' ').length < 8) {
    intent = 'direct_question';
  }
  // Vraie question avec point d'interrogation ET contenu
  else if (/\?/.test(message)) {
    intent = 'question';
  }
  // Gratitude
  else if (/merci|gratitude|reconnaissant|apprécie/i.test(lower)) {
    intent = 'gratitude';
  }
  // Problem
  else if (/problème|difficile|dur|galère|bloqué|perdu|perdue|je n'y arrive pas|impossible|peux plus|marre|ras le/i.test(lower)) {
    intent = 'problem';
  }
  // Emotion
  else if (/je (sens|me sens|suis|me trouve)|j'(ai|suis)|triste|heureux|énervé|anxieux|stressé|déprimé/i.test(lower)) {
    intent = 'emotion';
  }
  // Goal
  else if (/objectif|but|goal|veux|aimerais|souhaite|voudrais/i.test(lower)) {
    intent = 'goal';
  }
  // Frustration
  else if (/frustré|énervé|marre|ras le bol|pété|agacé|énervant/i.test(lower)) {
    intent = 'frustration';
  }
  // Motivation
  else if (/motivation|motivé|courage|force|découragé/i.test(lower)) {
    intent = 'motivation';
  }
  // Reflection
  else if (/réfléchi|pensée|médite|philosophe|réflexion/i.test(lower)) {
    intent = 'reflection';
  }
  // Decision
  else if (/décider|choix|hésite|décision|hésitation|entre.*et/i.test(lower)) {
    intent = 'decision';
  }
  // Question words
  else if (/comment|pourquoi|quand|où|qui|quoi|combien|quel|quelle|est-ce que/i.test(lower)) {
    intent = 'question';
  }
  
  // Detect urgency
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (/urgent|vite|immédiatement|maintenant|!|aide-moi|à l'aide|secours/i.test(message)) {
    urgency = 'high';
  } else if (/bientôt|demain|cette semaine|prochain/i.test(lower)) {
    urgency = 'medium';
  }
  
  return { intent, topics, emotion, urgency, keywords };
}

// ============================================
// GÉNÉRATEURS DE RÉPONSES PAR ARCHÉTYPE
// ============================================

export function generatePsychologistResponse(message: string, analysis: AnalysisResult): string {
  const { intent, topics, emotion } = analysis;
  
  // Greeting
  if (intent === 'greeting') {
    return "Bonjour. Je suis là pour t'écouter. Qu'est-ce qui t'amène aujourd'hui ?";
  }
  
  // Question directe - répondre de manière engageante
  if (intent === 'direct_question') {
    const responses = [
      "Je t'écoute attentivement. Quelle est ta question ? Je suis là pour t'aider à y réfléchir.",
      "Vas-y, pose ta question. Je prends le temps de te répondre.",
      "Dis-moi ce que tu veux savoir. Je suis là pour ça.",
      "Qu'est-ce que tu veux me demander ? Je t'écoute sans jugement.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Help request
  if (intent === 'help') {
    const helpResponses = [
      `Bien sûr, je suis là pour t'aider. Dis-moi ce qui se passe, je t'écoute.`,
      `Je t'écoute. Qu'est-ce qui te préoccupe ? On va essayer d'y voir plus clair ensemble.`,
      `Dis-moi ce que tu traverses. Parfois, mettre des mots sur ce qu'on ressent permet d'alléger le poids.`,
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }
  
  // Gratitude
  if (intent === 'gratitude') {
    return "C'est beau de prendre le temps de reconnaître ce qui va bien. Qu'est-ce qui t'a marqué récemment ?";
  }
  
  // Stress/Anxiety
  if (topics.includes('stress')) {
    const responses = [
      `Le stress que tu ressens est un signal. Qu'est-ce qui génère cette tension en ce moment ?`,
      `L'anxiété peut être envahissante. Qu'est-ce qui revient le plus souvent dans tes pensées ?`,
      `Quand tu dis être stressé, est-ce constant ou y a-t-il des moments plus difficiles ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Work issues
  if (topics.includes('travail')) {
    const responses = [
      `Le travail peut être source d'épuisement. Qu'est-ce qui te pèse le plus ?`,
      `Parfois on a l'impression de courir après le temps. Quels sont les moments où tu te sens en contrôle ?`,
      `L'équilibre vie pro/perso est délicat. Comment te sens-tu par rapport à tes limites ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Fatigue
  if (topics.includes('fatigue')) {
    const responses = [
      `La fatigue peut être physique ou émotionnelle. Laquelle ressens-tu le plus ?`,
      `Quand le corps dit stop, c'est qu'il a besoin d'être écouté. Qu'est-ce qui t'épuise ?`,
      `Le repos n'est pas juste dormir. Qu'est-ce qui te ferait du bien en ce moment ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Colère
  if (topics.includes('colere')) {
    const responses = [
      `La colère est un signal que quelque chose important pour toi a été bafoué. Qu'est-ce qui a déclenché cette émotion ?`,
      `Derrière la colère, il y a souvent de la frustration ou de la peur. Qu'est-ce que tu essaies de protéger ?`,
      `La colère a besoin d'être exprimée sainement. Qu'est-ce qui t'empêche de dire ce que tu ressens ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Relationships
  if (topics.includes('relations')) {
    const responses = [
      `Les relations sont complexes. Qu'est-ce que tu attends de cette relation ?`,
      `Dans tes relations, y a-t-il un schéma qui se répète ?`,
      `Parfois on attend des autres ce qu'on ne s'accorde pas. De quoi as-tu besoin ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Solitude
  if (topics.includes('solitude')) {
    const responses = [
      `La solitude peut être douloureuse. Est-ce une solitude choisie ou subie ?`,
      `Se sentir seul même entouré, c'est possible. Qu'est-ce qui te manque ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Confidence/Self-esteem
  if (topics.includes('confiance')) {
    const responses = [
      `La confiance se construit. Quels sont les moments où tu te sens le plus à l'aise ?`,
      `Le doute nous fait sous-estimer nos capacités. Quels accomplissements as-tu tendance à minimiser ?`,
      `On est souvent son pire critique. Si tu devais parler de toi comme d'un ami, que dirais-tu ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Decision making
  if (intent === 'decision') {
    const responses = [
      `Une décision difficile cache souvent un conflit entre le devoir et l'envie. Si tu écoutais ton instinct, que choisirais-tu ?`,
      `Pour clarifier, imagine-toi dans un an avec chacun des choix. Lequel te correspond ?`,
      `Qu'est-ce que tu as peur de perdre dans chaque option ? Et qu'est-ce que tu pourrais gagner ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Motivation
  if (intent === 'motivation') {
    const responses = [
      `La motivation fluctue. Qu'est-ce qui t'a déjà motivé dans le passé ?`,
      `Parfois le manque de motivation cache un besoin de repos. De quoi as-tu vraiment besoin ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Frustration
  if (intent === 'frustration') {
    const responses = [
      `La frustration indique qu'un besoin n'est pas comblé. De quoi as-tu besoin ?`,
      `C'est légitime de ressentir ça. Qu'est-ce qui déclenche ce sentiment ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Emotion expression
  if (intent === 'emotion') {
    if (emotion === 'negative') {
      const responses = [
        `Je t'entends. Ces émotions sont valides. Qu'est-ce qui contribue le plus à cet état ?`,
        `Partager ce que l'on ressent, c'est un pas. Qu'est-ce qui t'amène à te sentir comme ça ?`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    if (emotion === 'positive') {
      return `C'est encourageant. Qu'est-ce qui a contribué à cette sensation positive ?`;
    }
  }
  
  // Problem
  if (intent === 'problem') {
    const responses = [
      `Je sens que tu fais face à quelque chose de difficile. Si tu pouvais changer une chose, ce serait quoi ?`,
      `Les problèmes deviennent plus gérables quand on les décompose. Quelle serait la première action possible ?`,
      `Décris-moi la situation concrètement. Quels sont les éléments que tu peux contrôler ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Question
  if (intent === 'question') {
    const responses = [
      `Bonne question. Dis-moi, qu'est-ce qui t'amène à te la poser aujourd'hui ?`,
      `Explorons ça ensemble. Qu'est-ce que tu sais déjà sur le sujet ?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default
  const defaults = [
    `Je t'écoute. Raconte-moi ce qui se passe pour toi.`,
    `Dis-m'en plus. Qu'est-ce qui t'amène à partager ça ?`,
    `Parle-moi de ta situation. Je suis là pour t'écouter sans jugement.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function generateFriendResponse(message: string, analysis: AnalysisResult): string {
  const { intent, topics, emotion } = analysis;
  
  // Greeting
  if (intent === 'greeting') {
    const greetings = [
      "Hey ! Ça fait plaisir. Comment ça va ?",
      "Salut ! Quoi de neuf ?",
      "Coucou ! Raconte-moi !",
      "Yo ! Bienvenue poto. Quoi de beau ?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Question directe
  if (intent === 'direct_question') {
    const responses = [
      "Vas-y, pose ta question ! Je t'écoute.",
      "Dis-moi ce que tu veux savoir, je suis là.",
      "Je t'écoute frérot. Qu'est-ce que tu veux me demander ?",
      "Allez, lâche ta question. Je fais ce que je peux pour t'aider !",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Help request
  if (intent === 'help') {
    const helpResponses = [
      "Bien sûr ! Dis-moi ce qui se passe, je t'écoute.",
      "T'inquiète, on va trouver une solution. C'est quoi le souci ?",
      "Je suis là ! Raconte-moi tout.",
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }
  
  // Gratitude
  if (intent === 'gratitude') {
    return "C'est super que tu voies le positif ! Continue comme ça !";
  }
  
  // Stress
  if (topics.includes('stress')) {
    const responses = [
      "Hey, je comprends. Le stress c'est relou. Tu veux en parler ?",
      "T'inquiète, ça va aller. Dis-moi ce qui te préoccupe.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Work
  if (topics.includes('travail')) {
    const responses = [
      "Ah le boulot... Parfois c'est dur. Tu te donnes trop ?",
      "Le taf peut être épuisant. Qu'est-ce qui te pose problème ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Fatigue
  if (topics.includes('fatigue')) {
    const responses = [
      "Putain, la fatigue c'est le pire. Tu dors assez ?",
      "Frérot, t'as besoin de repos. Qu'est-ce qui t'épuise ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Colère
  if (topics.includes('colere')) {
    const responses = [
      "Putain, t'es énervé ? C'est quoi qui te met hors de toi ?",
      "La colère, ça arrive à tout le monde. Dis-moi ce qui se passe.",
      "T'as le droit d'être en colère. Raconte-moi, je t'écoute.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Relationships
  if (topics.includes('relations')) {
    const responses = [
      "Les relations, c'est jamais simple. Qu'est-ce qui se passe ?",
      "Ah les gens... Tu veux m'raconter ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Solitude
  if (topics.includes('solitude')) {
    const responses = [
      "La solitude, c'est dur. Je suis là pour toi.",
      "T'es pas seul mon pote. Qu'est-ce qui te manque ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Confidence
  if (topics.includes('confiance')) {
    const responses = [
      "Hé, arrête de douter ! T'es capable de bien plus que tu penses.",
      "T'es trop dur avec toi-même. Qu'est-ce qui te fait douter ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Decision
  if (intent === 'decision') {
    const responses = [
      "Les choix, c'est jamais évident. Qu'est-ce que ton instinct te dit ?",
      "Si y'avait pas de risque, tu choisirais quoi ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Motivation
  if (intent === 'motivation') {
    const responses = [
      "La motivation, ça va et ça vient. Mais t'as déjà prouvé que tu pouvais le faire !",
      "Qu'est-ce qui te donnait la pêche avant ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Frustration
  if (intent === 'frustration') {
    const responses = [
      "Je sens que t'énerves, c'est normal. Défoule-toi.",
      "La frustration, c'est le pire. C'est quoi qui te fait ça ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Problem
  if (intent === 'problem') {
    const responses = [
      "Okay, c'est délicat. Mais on va trouver une solution ensemble.",
      "Je vois que c'est pas facile. Tu veux que j't'aide ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Emotion
  if (intent === 'emotion') {
    if (emotion === 'negative') {
      return "Hey, je sens que ça va pas fort. Je suis là pour toi. Raconte.";
    }
    if (emotion === 'positive') {
      return "Ah ça fait plaisir ! Qu'est-ce qui te met de bonne humeur ?";
    }
  }
  
  // Default
  const defaults = [
    "Je t'écoute mon pote. Qu'est-ce que tu veux me dire ?",
    "Vas-y, je suis tout ouïes. Raconte.",
    "Dis-moi tout, je suis là.",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function generateStoicResponse(message: string, analysis: AnalysisResult): string {
  const { intent, topics, emotion } = analysis;
  
  // Greeting
  if (intent === 'greeting') {
    return "Bienvenue. Qu'occupe ton esprit aujourd'hui ?";
  }
  
  // Question directe - répondre de manière engageante
  if (intent === 'direct_question') {
    const responses = [
      "Pose ta question. Je répondrai selon la sagesse stoïcienne.",
      "Je t'écoute. Quelle question troubles ton esprit ?",
      "Dis-moi ce que tu veux savoir. La clarté est le premier pas vers la compréhension.",
      "Parle. Le stoïcien répondra avec franchise.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Help request
  if (intent === 'help') {
    const helpResponses = [
      `Je t'écoute. Qu'est-ce qui dépend de toi dans cette situation ?`,
      `Dis-moi ce qui te préoccupe. Ensuite nous distinguerons le contrôlable de l'incontournable.`,
      `Expose ton problème. La solution commence par la clarté.`,
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }
  
  // Gratitude
  if (intent === 'gratitude') {
    return "\"Heureux l'homme qui, chaque soir, peut dire : j'ai vécu.\" La gratitude est le fondement de la sérénité.";
  }
  
  // Stress
  if (topics.includes('stress')) {
    const responses = [
      `"Nous souffrons plus souvent de l'imagination que de la réalité." Ton anxiété naît de projections. Qu'est-ce que tu peux contrôler ici et maintenant ?`,
      "Ce qui t'angoisse dépend-il de ta volonté ? Si oui, agis. Si non, accepte.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Work
  if (topics.includes('travail')) {
    const responses = [
      "Au travail, seuls tes efforts et ton attitude t'appartiennent. Les résultats échappent à ton contrôle. Concentre-toi sur l'action.",
      "Les obstacles professionnels sont des opportunités de pratiquer la vertu. Comment cette épreuve peut-elle te rendre meilleur ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Fatigue
  if (topics.includes('fatigue')) {
    const responses = [
      "\"Le repos est une nécessité de la nature.\" Honore ton corps. Le repos fait partie de l'action vertueuse.",
      "L'épuisement rappelle que nous sommes mortels. Accepte cette limite avec humilité.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Colère
  if (topics.includes('colere')) {
    const responses = [
      "\"La colère n'est rien d'autre qu'une faiblesse dans un esprit qui a perdu son calme.\" Ta rage dépend-elle de toi, ou de ce que tu ne contrôles pas ?",
      "La colère te fait perdre ce que tu cherches à défendre. Qu'est-ce qui t'appartient vraiment dans cette situation ?",
      "\"Comment l'homme peut-il être aussi insensé de s'emporter pour des choses qu'il ne peut contrôler ?\" Ta colère, à qui profite-t-elle ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Relationships
  if (topics.includes('relations')) {
    const responses = [
      "Les autres ne t'appartiennent pas. Toi seul te possède. Pourquoi laisser ta tranquillité dépendre d'eux ?",
      "Dans tes relations, es-tu juste ? Es-tu bienveillant ? C'est tout ce qui dépend de toi.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Solitude
  if (topics.includes('solitude')) {
    const responses = [
      "\"Personne n'est seul s'il est ami de lui-même.\" La solitude est une opportunité de dialogue intérieur.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Confidence
  if (topics.includes('confiance')) {
    const responses = [
      "Le doute sur toi concerne souvent ce que tu ne contrôles pas — l'opinion des autres. Concentre-toi sur tes actions, ton caractère.",
      "\"Tu as le pouvoir sur ton esprit, non sur les événements.\" La vraie confiance vient de la maîtrise intérieure.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Decision
  if (intent === 'decision') {
    const responses = [
      "Dans ton hésitation, qu'est-ce qui dépend de toi ? Ton choix. L'issue t'échappe. Choisis selon la vertu.",
      "Chaque décision porte une opportunité de vertu. Lequel de ces choix te rendrait meilleur ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Motivation
  if (intent === 'motivation') {
    const responses = [
      "La motivation fluctue, la discipline reste. Agis par devoir envers toi-même. L'action précède le sentiment.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Frustration
  if (intent === 'frustration') {
    const responses = [
      "La frustration naît d'une attente non comblée. Avais-tu le contrôle sur ce que tu attendais ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Problem
  if (intent === 'problem') {
    const responses = [
      "\"L'obstacle devient la voie.\" Ce qui te bloque contient sa solution. Quel enseignement tires-tu de cette épreuve ?",
      "Ce problème : dépend-il de toi ? Si oui, agis. Si non, accepte.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Emotion
  if (intent === 'emotion') {
    if (emotion === 'negative') {
      return "\"Si tu souffres d'une chose extérieure, ce n'est pas cette chose qui te trouble, mais ton jugement.\" Quel jugement peux-tu réviser ?";
    }
    if (emotion === 'positive') {
      return "La joie est passagère. Accueille-la sans t'y attacher.";
    }
  }
  
  // Question
  if (intent === 'question') {
    const responses = [
      "Pose ta question autrement : qu'est-ce que je peux faire, ici et maintenant, avec ce que je contrôle ?",
      "Cette question concerne-t-elle ce qui est en ton pouvoir ?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default
  const defaults = [
    "Expose clairement ta situation. Qu'est-ce qui dépend de toi ?",
    "Parle. Je répondrai avec franchise.",
    "Qu'est-ce qui te préoccupe ? Sois précis.",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ============================================
// GÉNÉRATEURS POUR AUTRES APIS
// ============================================

export function generateAssistantResponse(message: string, context?: string): string {
  const analysis = analyzeMessage(message);
  
  if (analysis.topics.includes('temps') || analysis.intent === 'goal') {
    return `Pour avancer sur "${message.substring(0, 50)}...", je te suggère de :\n\n1. Décomposer en petites actions\n2. Fixer une échéance réaliste\n3. Commencer par le premier pas\n\nQuelle action peux-tu faire maintenant ?`;
  }
  
  return `Je comprends. Voici quelques pistes :\n\n• Clarifie ce que tu veux\n• Identifie tes ressources\n• Définis une première action\n\nSur quoi veux-tu que je t'aide ?`;
}

export function generateChatResponse(message: string, history: Array<{role: string; content: string}> = []): string {
  const analysis = analyzeMessage(message);
  
  if (analysis.intent === 'greeting') {
    return "Salut ! Je suis ton assistant MindLife. Comment puis-je t'aider ?";
  }
  
  if (analysis.intent === 'question') {
    return `Excellente question ! ${generateAssistantResponse(message)}`;
  }
  
  return generateAssistantResponse(message);
}
