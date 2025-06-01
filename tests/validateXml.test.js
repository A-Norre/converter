const { validateXml } = require('../src/utils');

test('returns the same text if it is valid', () => {
  expect(validateXml("Test")).toBe("Test");
});

test('throws error for unaccepted characters', () => {
  expect(() => validateXml("Illegal & signs")).toThrow(/Unaccepted characters in XML/);
});

test('returns correct text with numbers and allowed characters', () => {
  expect(validateXml("S:t Görans Torg 5")).toBe("S:t Görans Torg 5");
});
