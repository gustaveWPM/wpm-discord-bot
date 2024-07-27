import type { MaybeEmptyErrorsDetectionFeedback } from '@wpm-discord-bot/shared-types/String';

function mergeFeedbacks(
  feedback1: MaybeEmptyErrorsDetectionFeedback,
  feedback2: MaybeEmptyErrorsDetectionFeedback
): MaybeEmptyErrorsDetectionFeedback {
  if (feedback1 && feedback2) return feedback1 + '\n' + feedback2;
  if (!feedback1) return feedback2;
  return feedback1;
}

const foldFeedbacks = (...feedbacks: MaybeEmptyErrorsDetectionFeedback[]): MaybeEmptyErrorsDetectionFeedback =>
  feedbacks.reduce((mergedFeedback, feedback) => mergeFeedbacks(mergedFeedback, feedback), '');

export default foldFeedbacks;
