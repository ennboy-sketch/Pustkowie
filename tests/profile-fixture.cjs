// Old single-character scenarios start the migrated fixture via the real profile picker.
module.exports=async page=>{
  await page.locator('#profiles').waitFor({state:'visible'});
  await page.evaluate(()=>localStorage.removeItem('pustkowie.hero.v2.view'));
  await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.locator('[data-play-profile="legacy"]').click()]);
  await page.locator('#ready').waitFor({state:'visible'});
  await page.evaluate(()=>GameLocation.ready);
  if(await page.locator('#place-dialog').isVisible())await page.locator('#close-place').click();
};
