"use strict";
/* Future chapters may not be written yet. Pending is NOT a pass or an invented occurrence. */
function recurrenceReport(introductions,readingCounts,allCounts,plan,approvedChapterSet){
 const rows=[];for(const x of introductions){const n=x.first_chapter,lx=x.lexeme_id,first=readingCounts.get(n)?.get(lx)||0;
  const near=[n+1,n+2,n+3].filter(k=>k<=130);const nearCount=near.reduce((v,k)=>v+(allCounts.get(k)?.get(lx)||0),0);
  const nextReview=plan.reviews.find(c=>c>n);const reviewCount=nextReview?(readingCounts.get(nextReview)?.get(lx)||0):0;
  const introMin=n<=50?8:6;const pendingNear=near.some(k=>!approvedChapterSet.has(k));const pendingReview=nextReview&&!approvedChapterSet.has(nextReview);
  const problems=[];if(first<introMin)problems.push(`intro ${first}<${introMin}`);
  if(!pendingNear&&nearCount<4)problems.push(`next-three ${nearCount}<4`);
  if(nextReview&&!pendingReview&&reviewCount===0)problems.push(`review ${nextReview}: absent`);
  let longest=0,gap=0;const until=Math.min(n+40,130),windowEnd=Math.min(until,Math.max(n,...approvedChapterSet));
  for(let k=n+4;k<=windowEnd;k++){if(!approvedChapterSet.has(k)){gap=0;continue}gap=allCounts.get(k)?.has(lx)?0:gap+1;longest=Math.max(longest,gap)}
  const failMax=n<=90?20:30;if(longest>failMax)problems.push(`spacing gap ${longest}>${failMax}`);
  rows.push({lexeme_id:lx,chapter:n,in_chapter:first,next_three:nearCount,next_review:nextReview||null,review_occurrences:reviewCount,max_consecutive_missed_chapters:longest,followup_status:pendingNear||pendingReview?'PENDING_UNWRITTEN_CHAPTERS':problems.length?'FAIL':'PASS',problems});
 }
 return rows;
}
module.exports={recurrenceReport};
