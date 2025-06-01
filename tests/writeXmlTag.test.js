const { writeXmlTag, TAGS, NEWLINE } = require('../src/converter');


describe('writeXmlTag', () => {
  let mockStream;

  beforeEach(() => {
    mockStream = { write: jest.fn() };
  });

  test('writes correct tag with value', () => {
    writeXmlTag(mockStream, TAGS.firstName, 'Albert');
    expect(mockStream.write).toHaveBeenCalledWith(`<${TAGS.firstName}>Albert</${TAGS.firstName}>${NEWLINE}`);
  });
  
  test('writes self closing tag without value', () => {
    writeXmlTag(mockStream, TAGS.lastName, '');
    expect(mockStream.write).toHaveBeenCalledWith(`<${TAGS.lastName} />${NEWLINE}`);
  });
  
  test('writes self closing tag with null value', () => {
    writeXmlTag(mockStream, TAGS.city, null);
    expect(mockStream.write).toHaveBeenCalledWith(`<${TAGS.city} />${NEWLINE}`);
  });
});
