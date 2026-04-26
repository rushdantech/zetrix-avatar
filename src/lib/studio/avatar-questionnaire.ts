import { questionnaireQuestions, type QuestionnaireQuestion } from "@/lib/mock-data";

export type QuestionnaireAnswerMap = Record<number, string | string[] | number>;

const OPENING_MIN_FOR_GENERIC_BRIDGE = 8;

/**
 * Picks a short lead-in for questions 2–15 from keywords in the answer to question 1.
 */
function bridgeFromOpening(openingRaw: string): string | null {
  const t = openingRaw.trim();
  if (t.length < 3) return null;
  const l = t.toLowerCase();
  if (/\b(goals?|objectives?|objective|aims?|planning|plan\b|hoping|aspire|intend|priority|priorities)\b/.test(l)) {
    return "To build on the goals and priorities you shared —";
  }
  if (
    /\b(work|workplace|job|career|company|colleague|manager|role|industry|business|startup|client|stakeholder|salary|promotion|boss)\b/.test(l)
  ) {
    return "Given what you said about your work context —";
  }
  if (/\b(famil|parent|sibling|spouse|partner|marriage|child|children|friend|relationship|relatives?)\b/.test(l)) {
    return "Following what you told us about people in your life —";
  }
  if (/\b(stud(y|ies|ying)|university|school|degree|course|learn(ing|ed)?|education|thesis|campus)\b/.test(l)) {
    return "Tying into your learning path and background —";
  }
  if (/\b(health|fitness|stress|wellness|wellbeing|well-being|sleep|exercise|mental|therapy|burnout|anxiet|recover)\b/.test(l)) {
    return "With the wellbeing topics you brought up in mind —";
  }
  if (/\b(project|build(ing|)?|create|app|code|ship|product|deliver|deadline|launch|milestone|sprint)\b/.test(l)) {
    return "In light of the projects and outcomes you described —";
  }
  if (/\b(interest|hobbie|hobbies|passion|explor(e|ing)|curious|topic|mission|discuss|conversation)\b/.test(l)) {
    return "Building on the interests and topics you introduced —";
  }
  if (t.length >= OPENING_MIN_FOR_GENERIC_BRIDGE) {
    return "Building on your introduction —";
  }
  return null;
}

/**
 * 15 questions: Q1 is always open-ended. Q2–15 get an optional contextual lead-in from the Q1 text.
 */
export function getResolvedQuestionnaireQuestions(answers: QuestionnaireAnswerMap): QuestionnaireQuestion[] {
  const a1 = typeof answers[1] === "string" ? answers[1] : "";
  const bridge = bridgeFromOpening(a1);
  return questionnaireQuestions.map((q) => {
    if (q.id === 1) return { ...q };
    if (!bridge) return { ...q };
    return { ...q, question: `${bridge} ${q.question}` };
  });
}
