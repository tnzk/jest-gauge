/*
test('User must be logged in as "admin"', async () => {
  expect(1).toBe(1);
});
test('Open the product search page', async () => {
  expect(1).toBe(1);
});
test('Search for product "unknown"', async () => {
  expect(1).toBe(1);
});
test('The search results will be empty', async () => {
  expect(1).toBe(1);
});
*/

test('The word <Word> has <Vowel Count> vowels.', (word, vowerlCount) => {
  const n = (word.match(/[aiueo]/g) ?? []).length;
  expect(n.toString()).toBe(vowerlCount);
})