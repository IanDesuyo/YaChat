import { Note } from "../types/model";

const wordRanking = (notes: Note[]) => {
  const ranking: { [key: string]: number } = {};

  notes?.forEach(note => {
    note.keyPhrases?.forEach(keyPhrase => {
      if (ranking[keyPhrase.text]) {
        ranking[keyPhrase.text]++;
      } else {
        ranking[keyPhrase.text] = 1;
      }
    });
  });

  const sorted = Object.entries(ranking).sort((a, b) => b[1] - a[1]);

  return sorted;
};

export default wordRanking;
