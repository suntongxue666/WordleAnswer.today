// Wordlehints
export function generateHints(answer: string): { type: string; value: string }[] {
  const word = answer.toUpperCase();
  const hints: { type: string; value: string }[] = [];

  // 获取单词的基本信息
  const vowels = word.match(/[AEIOU]/g) || [];
  const consonants = word.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || [];
  const uniqueLetters = [...new Set(word)];
  const repeatedLetters = word.split('').filter((letter, index) => word.indexOf(letter) !== index);

  // 1. 基础结构提示
  hints.push({
    type: 'structure',
    value: `This word contains ${vowels.length} vowel${vowels.length !== 1 ? 's' : ''} and ${consonants.length} consonant${consonants.length !== 1 ? 's' : ''}.`
  });

  // 2. 首末字母提示
  hints.push({
    type: 'position',
    value: `It starts with the letter '${word[0]}' and ends with '${word[word.length - 1]}'.`
  });

  // 3. 特殊字母模式
  if (repeatedLetters.length > 0) {
    const repeatedSet = [...new Set(repeatedLetters)];
    if (repeatedSet.length === 1) {
      hints.push({
        type: 'pattern',
        value: `The word contains the letter '${repeatedSet[0]}' more than once.`
      });
    } else {
      hints.push({
        type: 'pattern',
        value: `This word has repeated letters.`
      });
    }
  }

  // 4. 元音特殊情况
  if (vowels.length >= 2) {
    const uniqueVowels = [...new Set(vowels)];
    if (uniqueVowels.length === 1) {
      hints.push({
        type: 'vowel',
        value: `All vowels in this word are the same letter.`
      });
    } else if (uniqueVowels.length === 2) {
      hints.push({
        type: 'vowel',
        value: `This word contains two different vowels.`
      });
    }
  }

  // 5. 字母表位置提示
  const firstLetterPos = word.charCodeAt(0) - 64; // A=1 B=2 etc.
  const lastLetterPos = word.charCodeAt(word.length - 1) - 64;

  if (firstLetterPos <= 13) {
    hints.push({
      type: 'alphabet',
      value: `The first letter is in the first half of the alphabet.`
    });
  } else {
    hints.push({
      type: 'alphabet',
      value: `The first letter is in the second half of the alphabet.`
    });
  }

  // 6. 常见字母组合
  const commonPairs = ['TH', 'ST', 'ND', 'ER', 'ON', 'RE', 'ED', 'IN', 'TO', 'IT'];
  const foundPairs = commonPairs.filter(pair => word.includes(pair));
  if (foundPairs.length > 0) {
    hints.push({
      type: 'pattern',
      value: `The word contains the common letter combination '${foundPairs[0]}'.`
    });
  }

  // 7. 生成一个更具体的描述性提示
  const categoryHints = generateCategoryHint(word);
  if (categoryHints) {
    hints.push({
      type: 'category',
      value: categoryHints
    });
  }

  return hints;
}

// 根据单词生成类别相关的提示
function generateCategoryHint(word: string): string | null {
  const categories = {
    animals: ['MOUSE', 'TIGER', 'HORSE', 'SHEEP', 'WHALE', 'SNAKE', 'EAGLE', 'SHARK'],
    colors: ['BLACK', 'WHITE', 'BROWN', 'GREEN', 'AMBER', 'CORAL'],
    nature: ['PLANT', 'OCEAN', 'RIVER', 'STONE', 'CLOUD', 'FIELD', 'BEACH', 'STORM'],
    objects: ['CHAIR', 'TABLE', 'PHONE', 'PAPER', 'CLOCK', 'LIGHT', 'BOARD', 'FRAME'],
    actions: ['WRITE', 'THINK', 'SPEAK', 'LEARN', 'TEACH', 'DANCE', 'LAUGH', 'SLEEP'],
    emotions: ['HAPPY', 'ANGRY', 'PROUD', 'BRAVE', 'QUIET', 'ALERT'],
    food: ['BREAD', 'APPLE', 'SUGAR', 'CREAM', 'HONEY', 'LEMON', 'GRAPE', 'SPICE'],
    body: ['BRAIN', 'HEART', 'CHEST', 'ELBOW', 'THUMB', 'TOOTH'],
    home: ['HOUSE', 'FLOOR', 'CHAIR', 'SHELF', 'STOVE', 'TOWEL'],
    time: ['TODAY', 'MONTH', 'NIGHT', 'EARLY', 'LATER', 'TIMER'],
    weather: ['SUNNY', 'RAINY', 'WINDY', 'SNOWY', 'FOGGY', 'STORM', 'CLOUD'],
    technology: ['PHONE', 'ROBOT', 'CYBER', 'DIGITAL', 'SMART']
  };

  for (const [category, words] of Object.entries(categories)) {
    if (words.includes(word)) {
      switch (category) {
        case 'animals':
          return 'This word refers to a living creature from the animal kingdom.';
        case 'colors':
          return 'This word describes a color or shade.';
        case 'nature':
          return 'This word is related to the natural world.';
        case 'objects':
          return 'This word refers to a physical object you might find around you.';
        case 'actions':
          return 'This word describes something you can do or an action you can take.';
        case 'emotions':
          return 'This word relates to feelings or emotional states.';
        case 'food':
          return 'This word is related to food or something edible.';
        case 'body':
          return 'This word refers to a part of the human body.';
        case 'home':
          return 'This word describes something you might find in a home.';
        case 'time':
          return 'This word is related to time or temporal concepts.';
        case 'weather':
          return 'This word describes weather conditions or atmospheric phenomena.';
        case 'technology':
          return 'This word is related to technology or modern devices.';
      }
    }
  }

  // 如果没有找到特定类别，生成一个通用提示
  const wordLength = word.length;
  if (wordLength === 5) {
    return 'This is a common English word that you might use in everyday conversation.';
  }

  return null;
}

// 根据单词生成难度评级
export function generateDifficulty(answer: string): string {
  const word = answer.toUpperCase();
  let difficultyScore = 0;

  // 基础分数
  const vowels = word.match(/[AEIOU]/g) || [];
  const consonants = word.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || [];
  const uniqueLetters = [...new Set(word)];

  // 元音数量影响难度
  if (vowels.length <= 1) difficultyScore += 2; // 很少元音 = 更难
  if (vowels.length >= 4) difficultyScore += 1; // 很多元音 = 稍难

  // 重复字母影响难度
  if (uniqueLetters.length < word.length) {
    difficultyScore += 1; // 有重复字母 = 稍难
  }

  // 不常见字母影响难度
  const uncommonLetters = word.match(/[JQXZ]/g) || [];
  difficultyScore += uncommonLetters.length * 2;

  // 常见单词降低难度
  const commonWords = [
    'ABOUT', 'AFTER', 'AGAIN', 'AGAINST', 'ALONG', 'AMONG', 'ANSWER', 'AROUND',
    'BECAUSE', 'BEFORE', 'BEING', 'BELOW', 'BETWEEN', 'BOTH', 'BRING', 'BUILD',
    'CLOSE', 'COME', 'COULD', 'COURSE', 'DURING', 'EARLY', 'EVERY', 'EXAMPLE',
    'FIELD', 'FIRST', 'FOUND', 'GREAT', 'GROUP', 'HAND', 'HARD', 'HAVE',
    'HOUSE', 'HUMAN', 'LARGE', 'LEARN', 'LIGHT', 'MIGHT', 'NEVER', 'NIGHT',
    'OTHER', 'PLACE', 'POINT', 'POWER', 'RIGHT', 'SMALL', 'SOUND', 'STILL',
    'THEIR', 'THERE', 'THESE', 'THINK', 'THREE', 'UNDER', 'UNTIL', 'WATER',
    'WHERE', 'WHICH', 'WHILE', 'WORLD', 'WOULD', 'WRITE', 'YOUNG'
  ];

  if (commonWords.includes(word)) {
    difficultyScore -= 1;
  }

  // 根据分数确定难度
  if (difficultyScore <= 0) return 'Easy';
  if (difficultyScore <= 2) return 'Medium';
  return 'Hard';
}