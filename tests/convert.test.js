const fs = require("fs");
const readline = require("readline");
const { Converter } = require("../src/converter");

jest.mock("fs");
jest.mock("readline");

describe("Converter tests", () => {
  let linesToEmit;
  let mockWriteStream;
  let converter;

  beforeEach(() => {
    linesToEmit = [];

    mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    fs.createReadStream.mockReturnValue({});
    fs.createWriteStream.mockReturnValue(mockWriteStream);

    readline.createInterface.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        while (linesToEmit.length > 0) {
          yield linesToEmit.shift();
        }
      },
      on: jest.fn(),
    });

    converter = new Converter("input.txt", "output.xml");
  });

  test("writes correct XML for valid P row", async () => {
    linesToEmit.push("P|Anna|Karlsson");

    await converter.convert();

    expect(mockWriteStream.write).toHaveBeenCalled();

    const writtenContent = mockWriteStream.write.mock.calls.flat().join("");

    expect(writtenContent).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(writtenContent).toContain("<people>");
    expect(writtenContent).toContain("<firstName>Anna</firstName>");
    expect(writtenContent).toContain("<lastName>Karlsson</lastName>");
    expect(writtenContent).toContain("</people>");

    expect(mockWriteStream.end).toHaveBeenCalled();
  });

  test("throws error on lowercase type letter", async () => {
    linesToEmit.push("p|Anna|Karlsson");

    await expect(converter.convert()).rejects.toThrow();
  });

  test("throws error on unknown type letter", async () => {
    linesToEmit.push("X|Anna|Karlsson");

    await expect(converter.convert()).rejects.toThrow();
  });
});
