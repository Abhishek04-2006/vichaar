/* 
  Content Moderation Service
  Uses bad-words library to detect profanity and inappropriate content.
  This should ideally be run server-side with firebase-admin for security,
  but is implemented client-side for this demo.
*/

import { Filter } from 'bad-words';

export const analyzeContent = (text) => {
  const filter = new Filter();

  // Add custom words for additional moderation if needed
  // filter.addWords('customword1', 'customword2'); 

  // The bad-words library only has isProfane() and clean() methods
  // Return true if profanity is detected, false otherwise
  return filter.isProfane(text);
};
