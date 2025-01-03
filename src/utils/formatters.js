export function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

export function formatWordInfo(wordInfo) {
  const {
    word,
    pronunciation,
    partOfSpeech,
    definition,
    vietnameseDefinition,
    examples,
    vietnameseExamples,
    synonyms,
  } = wordInfo;

  const youglishLink = `https://youglish.com/pronounce/${encodeURIComponent(
    word
  )}/english`;

  return `
📝: ${escapeMarkdown(word)}
🗣: ${escapeMarkdown(pronunciation)}
*Part of Speech*: ${escapeMarkdown(partOfSpeech)}
🇬🇧: ${escapeMarkdown(definition)}
🇻🇳: ${escapeMarkdown(vietnameseDefinition)}

*Examples*:
${examples
  .map(
    (ex, i) =>
      `• ${escapeMarkdown(ex)}\n  ↳ ${escapeMarkdown(vietnameseExamples[i])}`
  )
  .join("\n")}

${
  synonyms.length > 0
    ? `*Synonyms*: ${synonyms.map((s) => escapeMarkdown(s)).join(", ")}`
    : ""
}

*🌐 Pronunciation Guide*: [YouGlish](${youglishLink})
`;
}

export function formatQuiz(quizData) {
  const { question, options, correctAnswer, explanation } = quizData;

  return `
*Question*: ${escapeMarkdown(question)}

*Options*:
${options.map((opt, idx) => `${idx + 1}\\. ${escapeMarkdown(opt)}`).join("\n")}

||*Correct Answer*: ${escapeMarkdown(correctAnswer)}
*Explanation*: ${escapeMarkdown(explanation)}||
`;
}

export function formatProfile(user) {
  return `
*User Profile*
\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-
*Username*: ${escapeMarkdown(user.username)}
*Words Learned*: ${user.wordsLearned.length}
*Study Streak*: ${user.streakDays} days
*Quiz Performance*: ${Math.round(
    (user.quizStats.correctAnswers / user.quizStats.totalAttempts) * 100 || 0
  )}% correct
`;
}

export function formatWordList(words) {
  if (words.length === 0) {
    return "*No words learned yet\\!*";
  }

  return `
*Your Vocabulary List* \\(${words.length} words\\)
\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-
${words
  .map(
    (w, idx) =>
      `${idx + 1}\\. ${escapeMarkdown(w.word)} \\- ${escapeMarkdown(
        w.definition
      )}`
  )
  .join("\n")}
`;
}

export function formatWordPairs(wordPairs) {
  if (wordPairs.length === 0) {
    return "*No word pairs found\\!*";
  }

  return `
*Word Pairs Analysis*
\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-
${wordPairs
  .map(
    (pair, idx) => `
${idx + 1}\\. *${escapeMarkdown(pair.pair)}*
🇬🇧: ${escapeMarkdown(pair.definition)}
🇻🇳: ${escapeMarkdown(pair.vietnameseDefinition)}
*Example*: ${escapeMarkdown(pair.example)}
  ↳ ${escapeMarkdown(pair.vietnameseExample)}
`
  )
  .join("\n")}
`;
}
