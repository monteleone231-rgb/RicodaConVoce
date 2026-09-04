/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode, MedicationCategory } from './types';

export interface ParsedSpokenReminder {
  name: string;
  time: string; // "HH:mm"
  times: string[];
  dosage: string;
  notes: string;
  category: MedicationCategory;
  rawTranscript: string;
}

const IT_NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'un': 1, 'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4,
  'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10,
  'undici': 11, 'dodici': 12, 'tredici': 13, 'quattordici': 14, 'quindici': 15,
  'sedici': 16, 'diciassette': 17, 'diciotto': 18, 'diciannove': 19, 'venti': 20,
  'ventuno': 21, 'ventidue': 22, 'ventitré': 23, 'ventitre': 23, 'ventiquattro': 24,
  'trenta': 30, 'trentacinque': 35, 'quaranta': 40, 'quarantacinque': 45, 'cinquanta': 50
};

const EN_NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
  'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'eleven': 11, 'twelve': 12,
  'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
  'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50
};

const ES_NUMBER_WORDS: Record<string, number> = {
  'cero': 0, 'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
  'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
  'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
  'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24, 'treinta': 30
};

const FR_NUMBER_WORDS: Record<string, number> = {
  'zéro': 0, 'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
  'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10, 'onze': 11, 'douze': 12,
  'treize': 13, 'quatorze': 14, 'quinze': 15, 'seize': 16, 'dix-sept': 17, 'dix-huit': 18,
  'dix-neuf': 19, 'vingt': 20, 'trente': 30, 'quarante': 40, 'cinquante': 50
};

const DE_NUMBER_WORDS: Record<string, number> = {
  'null': 0, 'eins': 1, 'eine': 1, 'ein': 1, 'zwei': 2, 'drei': 3, 'vier': 4,
  'fünf': 5, 'sechs': 6, 'sieben': 7, 'acht': 8, 'neun': 9, 'zehn': 10,
  'elf': 11, 'zwölf': 12, 'dreizehn': 13, 'vierzehn': 14, 'fünfzehn': 15,
  'sechzehn': 16, 'siebzehn': 17, 'achtzehn': 18, 'neunzehn': 19, 'zwanzig': 20
};

function padTwo(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Parses a spoken string into structured reminder attributes.
 */
export function parseSpokenReminder(rawText: string, lang: LanguageCode): ParsedSpokenReminder {
  const original = rawText.trim();
  let text = original.toLowerCase();

  // Normalize accents and punctuation
  text = text.replace(/[,;]/g, ' ');

  let extractedHour: number | null = null;
  let extractedMinute: number | null = null;
  let timeMatchPhrase = '';

  // 1. Check special terms: mezzogiorno / mezzanotte / noon / midnight
  if (/\b(a\s+)?mezzogiorno\b/i.test(text) || /\b(at\s+)?noon\b/i.test(text) || /\bal\s+mediod[ií]a\b/i.test(text) || /\bà\s+midi\b/i.test(text) || /\bmittags\b/i.test(text)) {
    extractedHour = 12;
    extractedMinute = 0;
    timeMatchPhrase = text.match(/\b((a\s+)?mezzogiorno|(at\s+)?noon|al\s+mediod[ií]a|à\s+midi|mittags)\b/i)?.[0] || '';
  } else if (/\b(a\s+)?mezzanotte\b/i.test(text) || /\b(at\s+)?midnight\b/i.test(text) || /\ba\s+la\s+medianoche\b/i.test(text) || /\bà\s+minuit\b/i.test(text) || /\bmitternacht\b/i.test(text)) {
    extractedHour = 0;
    extractedMinute = 0;
    timeMatchPhrase = text.match(/\b((a\s+)?mezzanotte|(at\s+)?midnight|a\s+la\s+medianoche|à\s+minuit|mitternacht)\b/i)?.[0] || '';
  }

  // 2. Explicit digital time e.g., "16:30", "16.30", "8:00", "08:15"
  if (extractedHour === null) {
    const digitalRegex = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/;
    const digMatch = text.match(digitalRegex);
    if (digMatch) {
      extractedHour = parseInt(digMatch[1], 10);
      extractedMinute = parseInt(digMatch[2], 10);
      timeMatchPhrase = digMatch[0];
    }
  }

  // 3. Natural speech patterns (Italian: "alle 8 e mezza", "alle 8 di sera", "alle otto e un quarto", "alle 17", etc.)
  if (extractedHour === null) {
    const numWordsKeys = Object.keys(IT_NUMBER_WORDS).join('|');
    // Pattern: "alle (numero|parola) [e mezza|e un quarto|meno un quarto|di sera|del pomeriggio|di mattina]"
    const itNaturalRegex = new RegExp(
      `\\b(?:alle|ore|verso\\s+le)\\s+(\\d{1,2}|${numWordsKeys})` +
      `(?:\\s*(?:e|ed)\\s*(mezza|mezzo|un\\s+quarto|${numWordsKeys}|\\d{1,2})|\\s*meno\\s*(?:un\\s+quarto|\\d{1,2}))?` +
      `(?:\\s*(di\\s+sera|del\\s+pomeriggio|della\\s+sera|della\\s+notte|di\\s+notte|di\\s+mattina|del\\s+mattino))?\\b`,
      'i'
    );
    const itMatch = text.match(itNaturalRegex);
    if (itMatch) {
      timeMatchPhrase = itMatch[0];
      const hourPart = itMatch[1];
      const minutePart = itMatch[2];
      const amPmPart = itMatch[3];

      let rawHour = IT_NUMBER_WORDS[hourPart.toLowerCase()] ?? parseInt(hourPart, 10);
      let rawMinute = 0;

      if (minutePart) {
        const minLower = minutePart.toLowerCase();
        if (minLower === 'mezza' || minLower === 'mezzo') {
          rawMinute = 30;
        } else if (minLower.includes('un quarto')) {
          if (itMatch[0].includes('meno')) {
            rawMinute = 45;
            rawHour = (rawHour - 1 + 24) % 24;
          } else {
            rawMinute = 15;
          }
        } else {
          rawMinute = IT_NUMBER_WORDS[minLower] ?? parseInt(minLower, 10) ?? 0;
        }
      }

      if (amPmPart) {
        const period = amPmPart.toLowerCase();
        if ((period.includes('sera') || period.includes('pomeriggio')) && rawHour < 12) {
          rawHour += 12;
        } else if (period.includes('mattina') && rawHour === 12) {
          rawHour = 0;
        }
      } else if (rawHour <= 7 && !timeMatchPhrase.includes('mattina')) {
        // Human heuristic: an alarm at "6" or "7" without context is morning 06:00/07:00, but "8" could be 08:00 or 20:00.
        // We keep 08:00 by default.
      }

      extractedHour = Math.min(23, Math.max(0, rawHour));
      extractedMinute = Math.min(59, Math.max(0, rawMinute));
    }
  }

  // 4. English natural patterns: "at 8:30 pm", "at 5 pm", "at 9 am", "at eight thirty"
  if (extractedHour === null) {
    const enNumKeys = Object.keys(EN_NUMBER_WORDS).join('|');
    const enRegex = new RegExp(
      `\\b(?:at)\\s+(\\d{1,2}|${enNumKeys})` +
      `(?:\\s*(?:and|past)\\s*(half|a\\s+quarter|\\d{1,2}))?` +
      `(?:\\s*(am|pm|in\\s+the\\s+morning|in\\s+the\\s+evening|in\\s+the\\s+afternoon|at\\s+night))?\\b`,
      'i'
    );
    const enMatch = text.match(enRegex);
    if (enMatch) {
      timeMatchPhrase = enMatch[0];
      const hStr = enMatch[1];
      const mStr = enMatch[2];
      const period = enMatch[3];

      let rawH = EN_NUMBER_WORDS[hStr.toLowerCase()] ?? parseInt(hStr, 10);
      let rawM = 0;

      if (mStr) {
        const mLower = mStr.toLowerCase();
        if (mLower.includes('half')) rawM = 30;
        else if (mLower.includes('quarter')) rawM = 15;
        else rawM = EN_NUMBER_WORDS[mLower] ?? parseInt(mLower, 10) ?? 0;
      }

      if (period) {
        const pLower = period.toLowerCase();
        if ((pLower.includes('pm') || pLower.includes('evening') || pLower.includes('afternoon')) && rawH < 12) {
          rawH += 12;
        } else if (pLower.includes('am') && rawH === 12) {
          rawH = 0;
        }
      }

      extractedHour = Math.min(23, Math.max(0, rawH));
      extractedMinute = Math.min(59, Math.max(0, rawM));
    }
  }

  // 5. Spanish/French/German basic patterns
  if (extractedHour === null) {
    // General fallback: "a las 10", "à 10h", "um 10 Uhr"
    const generalRegex = /\b(?:a\s+las|à|um)\s+(\d{1,2})(?:\s*h(?:eures?)?|\s*uhr)?(?:\s*(?:y|et|und)\s*(\d{1,2}|media|demie|halb))?\b/i;
    const genMatch = text.match(generalRegex);
    if (genMatch) {
      timeMatchPhrase = genMatch[0];
      let h = parseInt(genMatch[1], 10);
      let m = 0;
      const mStr = (genMatch[2] || '').toLowerCase();
      if (mStr === 'media' || mStr === 'demie' || mStr === 'halb') {
        m = 30;
      } else if (mStr) {
        m = parseInt(mStr, 10) || 0;
      }
      extractedHour = Math.min(23, Math.max(0, h));
      extractedMinute = Math.min(59, Math.max(0, m));
    }
  }

  // Determine final formatted time (HH:mm)
  let finalTime = '08:00';
  if (extractedHour !== null && extractedMinute !== null) {
    finalTime = `${padTwo(extractedHour)}:${padTwo(extractedMinute)}`;
  } else {
    // Heuristic: default to next whole hour or 1 hour from now
    const now = new Date();
    const nextH = (now.getHours() + 1) % 24;
    finalTime = `${padTwo(nextH)}:00`;
  }

  // 6. Extract Dosage
  let extractedDosage = '';
  let dosageMatchPhrase = '';
  const dosageRegex = /\b(\d+|\buna\b|\bdue\b|\btre\b|\bquattro\b|\bcinque\b|\bmezzo\b|\bmezza\b|\bone\b|\btwo\b|\bthree\b|\bhalf\b|\bdos\b|\btres\b|\bune\b|\bdeux\b|\btrois\b|\beine\b|\bzwei\b|\bdrei\b)\s*(compresse?|pillole?|gocce?|bustine?|capsule?|cucchiai?|pasticche?|fiale?|flaconcino?|spray|puff|mg|ml|grammi?|litri?|bicchier[ie]?|tablets?|pills?|drops?|sachets?|capsules?|spoons?|doses?|glasses?|comprimidos?|pastillas?|gotas?|sobres?|cápsulas?|cucharadas?|gélules?|cuillères?|tropfen?|beutel?|kapseln?)\b/i;
  const doseMatch = text.match(dosageRegex);
  if (doseMatch) {
    extractedDosage = doseMatch[0];
    dosageMatchPhrase = doseMatch[0];
  }

  // 7. Detect Category based on context words
  let detectedCategory: MedicationCategory = 'pill';
  if (/\b(acqua|bere|bicchiere|bottiglia|tisana|tè|idratazione|water|drink|boire|beber|trinken)\b/i.test(text)) {
    detectedCategory = 'bottle';
  } else if (/\b(sciroppo|gocce|liquido|gouttes|drops|jarabe|gotas|saft|tropfen)\b/i.test(text)) {
    detectedCategory = 'liquid';
  } else if (/\b(capsul[ae]|gélule|kapsel)\b/i.test(text)) {
    detectedCategory = 'capsule';
  } else if (/\b(spray|aerosol|inalatore|inhaler|inhalateur)\b/i.test(text)) {
    detectedCategory = 'inhaler';
  } else if (/\b(pomata|crema|gel|cream|crème|ungüento|salbe)\b/i.test(text)) {
    detectedCategory = 'cream';
  } else if (/\b(iniezione|siringa|puntura|injection|spritze)\b/i.test(text)) {
    detectedCategory = 'injection';
  } else if (/\b(camminata|passeggiata|chiamare|telefonare|medico|dottore|visita|call|walk|walks|appointment|arzt)\b/i.test(text)) {
    detectedCategory = 'other';
  }

  // 8. Extract Notes / Context (e.g. "a stomaco pieno", "dopo i pasti", "prima di dormire")
  let extractedNotes = '';
  const notesRegex = /\b(a\s+stomaco\s+pieno|a\s+stomaco\s+vuoto|dopo\s+pranzo|dopo\s+cena|dopo\s+i\s+pasti|prima\s+di\s+dormire|prima\s+di\s+cena|al\s+risveglio|with\s+food|after\s+meals?|before\s+bed|con\s+comida|después\s+de\s+comer|avant\s+de\s+dormir|nach\s+dem\s+essen)\b/i;
  const notesMatch = text.match(notesRegex);
  if (notesMatch) {
    extractedNotes = notesMatch[0].charAt(0).toUpperCase() + notesMatch[0].slice(1);
  }

  // 9. Clean Name / Title
  // Strip out command introductory prefixes
  let cleanName = original;

  const prefixesToRemove = [
    /^(?:ricordami\s+di\s+|ricordati\s+di\s+|ricorda\s+di\s+|ricordami\s+|devo\s+|promemoria\s+per\s+|promemoria\s+|metti\s+un\s+promemoria\s+per\s+|metti\s+un\s+promemoria\s+|imposta\s+allarme\s+per\s+|imposta\s+promemoria\s+per\s+|imposta\s+un\s+promemoria\s+per\s+|imposta\s+allarme\s+|imposta\s+un\s+allarme\s+|svegliami\s+alle\s+|segnami\s+|fissami\s+|vorrei\s+|avvisami\s+di\s+|avvisami\s+per\s+|avvisa\s+di\s+)/i,
    /^(?:remind\s+me\s+to\s+|remind\s+me\s+|set\s+a\s+reminder\s+to\s+|set\s+a\s+reminder\s+for\s+|set\s+an\s+alarm\s+for\s+|reminder\s+for\s+|i\s+need\s+to\s+|wake\s+me\s+up\s+at\s+|alert\s+me\s+to\s+)/i,
    /^(?:recuérdame\s+que\s+|recuérdame\s+|recordarme\s+|pon\s+una\s+alarma\s+para\s+|pon\s+un\s+recordatorio\s+para\s+|avísame\s+)/i,
    /^(?:rappelle-moi\s+de\s+|rappelle\s+moi\s+de\s+|rappelle-moi\s+|mettre\s+un\s+rappel\s+pour\s+|alerte-moi\s+)/i,
    /^(?:erinnere\s+mich\s+an\s+|erinnere\s+mich\s+daran\s+|setze\s+eine\s+erinnerung\s+für\s+|wecke\s+mich\s+um\s+)/i
  ];

  prefixesToRemove.forEach(regex => {
    cleanName = cleanName.replace(regex, '');
  });

  // Remove time phrase
  if (timeMatchPhrase) {
    const escapedTime = timeMatchPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleanName = cleanName.replace(new RegExp(`\\b(?:alle|at|a\\s+las|à|um)?\\s*${escapedTime}`, 'gi'), '');
  }

  // Remove dosage phrase
  if (dosageMatchPhrase) {
    const escapedDose = dosageMatchPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleanName = cleanName.replace(new RegExp(`\\b${escapedDose}`, 'gi'), '');
  }

  // Remove notes phrase
  if (extractedNotes) {
    const escapedNotes = extractedNotes.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleanName = cleanName.replace(new RegExp(`\\b${escapedNotes}`, 'gi'), '');
  }

  // Cleanup stray prepositions like "di", "per", "alle", "a", "at", "to", "for" left at ends
  cleanName = cleanName
    .replace(/\b(alle|a|di|per|con|del|della|in|at|to|for|with|de|pour|für)\s*$/gi, '')
    .replace(/^\s*(di|per|a|to|for|de|pour|für)\s+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If after cleaning it's empty, create a friendly fallback name based on category
  if (!cleanName || cleanName.length < 2) {
    if (detectedCategory === 'bottle') {
      cleanName = lang === 'it' ? "Bere un bicchiere d'acqua" : lang === 'es' ? "Beber un vaso de agua" : lang === 'fr' ? "Boire un verre d'eau" : lang === 'de' ? "Ein Glas Wasser trinken" : "Drink a glass of water";
    } else {
      cleanName = lang === 'it' ? `Promemoria ore ${finalTime}` : lang === 'es' ? `Recordatorio a las ${finalTime}` : lang === 'fr' ? `Rappel à ${finalTime}` : lang === 'de' ? `Erinnerung um ${finalTime}` : `Reminder at ${finalTime}`;
    }
  } else {
    // Capitalize first letter
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  const defaultDose = detectedCategory === 'bottle'
    ? (lang === 'it' ? '1 bicchiere' : lang === 'es' ? '1 vaso' : lang === 'fr' ? '1 verre' : lang === 'de' ? '1 Glas' : '1 glass')
    : (lang === 'it' ? '1 dose' : lang === 'es' ? '1 dosis' : lang === 'fr' ? '1 dose' : lang === 'de' ? '1 Dosis' : '1 dose');

  return {
    name: cleanName,
    time: finalTime,
    times: [finalTime],
    dosage: extractedDosage || defaultDose,
    notes: extractedNotes,
    category: detectedCategory,
    rawTranscript: original
  };
}
