test("Open <url>", async (url) => {
  await openBrowser({ observe: true, headless: false });
  await goto(url);
}, 30000);
  
test("The user sees a cute cucumber-looking white bird", async () => {
  await write('what is the name of the bird on DuckDuckGo');
  await press('Enter');
  const existence = await text('Kettle').exists();
  expect(existence).toBe(true);
  await closeBrowser();
}, 30000);