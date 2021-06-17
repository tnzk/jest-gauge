test("Open <url>", async (url) => {
  // TODO: Using this and focus other window while tests are running causes a leaked worker process. Weird.
  await openBrowser({ observe: false, headless: false });
  await goto(url);
}, 30000);
  
test("The user sees name of the cute cucumber-looking white bird", async () => {
  await write('what is the name of the bird on DuckDuckGo');
  await press('Enter');
  const existence = await text('Kettle').exists();
  expect(existence).toBe(true);
  await closeBrowser();
}, 30000);