const { writeXmlElement, TAGS, NEWLINE } = require('../src/utils');


describe('writeXmlElement', () => {
  let mockStream;

  beforeEach(() => {
    mockStream = { write: jest.fn() };
  });

  test('writes correct tag with value', () => {
    writeXmlElement(mockStream, TAGS.firstName, 'Albert');
    expect(mockStream.write).toHaveBeenCalledWith(`<${TAGS.firstName}>Albert</${TAGS.firstName}>${NEWLINE}`);
  });
  
  test('writes self closing tag without value', () => {
    writeXmlElement(mockStream, TAGS.lastName, '');
    expect(mockStream.write).toHaveBeenCalledWith(`<${TAGS.lastName} />${NEWLINE}`);
  });
  
  test('writes self closing tag with null value', () => {
    writeXmlElement(mockStream, TAGS.city, null);
    expect(mockStream.write).toHaveBeenCalledWith(`<${TAGS.city} />${NEWLINE}`);
  });
});
