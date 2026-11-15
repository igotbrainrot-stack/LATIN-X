"use strict";
/* The program opens on Home since the November 2026 redesign. Suites written for the
   reader call this after loading (and after dismissing the course guide) to open
   Lēctiō the way a learner does: with the Read tab. Safe on pages without the shell. */
async function toReader(page){
 const tab=page.locator('#tabs [data-tab="read"]');
 if(!(await tab.count()))return false;
 if(!(await page.locator("#main .home-head").count()))return false;
 await tab.click();
 return true;
}
/* Backups, restore, reset and recording export live in Settings. */
async function toSettings(page){
 await page.locator('.appbar [data-tab="settings"]').click();
 await page.locator("#main .set-group").first().waitFor();
}
module.exports={toReader,toSettings};
