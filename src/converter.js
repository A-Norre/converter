const fs = require("fs");
const readline = require("readline");

class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.address = null;
    this.phone = null;
    this.family = [];
  }
}

class FamilyMember {
  constructor(name, birthYear) {
    this.name = name;
    this.birthYear = birthYear;
    this.address = null;
    this.phone = null;
  }
}

class Address {
  constructor(street, city, zip) {
    this.street = street;
    this.city = city;
    this.zip = zip;
  }
}

class Phone {
  constructor(mobile, landline) {
    this.mobile = mobile;
    this.landline = landline;
  }
}

const NEWLINE = "\n";
const INDENT_SIZE = 2;

const TAGS = {
  rootStart: `<?xml version="1.0" encoding="UTF-8"?>${NEWLINE}<people>${NEWLINE}`,
  rootEnd: `</people>${NEWLINE}`,
  personStart: "<person>",
  personEnd: "</person>",
  addressStart: "<address>",
  addressEnd: "</address>",
  phoneStart: "<phone>",
  phoneEnd: "</phone>",
  familyStart: "<family>",
  familyEnd: "</family>",
  firstName: "firstName",
  lastName: "lastName",
  street: "street",
  city: "city",
  zip: "zip",
  mobile: "mobile",
  landline: "landline",
  name: "name",
  born: "born"
};

const INDEX = {
  P: { firstName: 0, lastName: 1 },
  F: { name: 0, born: 1 },
  A: { street: 0, city: 1, zip: 2 },
  T: { mobile: 0, landline: 1 }
};

function indent(level) {
  return " ".repeat(level * INDENT_SIZE);
}

function escapeXml(text) {
  if (text === null || text === undefined) return "";

  const str = String(text);
  const illegalSymbols = /[&<>"'#()[\]{}$%*^=~`\\|@]|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF]/;
  if (illegalSymbols.test(str)) {
    throw new Error(`Unaccepted characters in XML: "${str}"`);
  }
  return str;
}

function writeXmlTag(stream, tagName, value, level) {
  const ind = indent(level);
  if (value === null || value === undefined || value === "") {
    stream.write(`${ind}<${tagName} />${NEWLINE}`);
  } else {
    stream.write(`${ind}<${tagName}>${escapeXml(value)}</${tagName}>${NEWLINE}`);
  }
}

function writeAddress(stream, address, level) {
  stream.write(`${indent(level)}${TAGS.addressStart}${NEWLINE}`);
  writeXmlTag(stream, TAGS.street, address.street || "", level + 1);
  writeXmlTag(stream, TAGS.city, address.city || "", level + 1);
  writeXmlTag(stream, TAGS.zip, address.zip || "", level + 1);
  stream.write(`${indent(level)}${TAGS.addressEnd}${NEWLINE}`);
}

function writePhone(stream, phone, level) {
  stream.write(`${indent(level)}${TAGS.phoneStart}${NEWLINE}`);
  writeXmlTag(stream, TAGS.mobile, phone.mobile || "", level + 1);
  writeXmlTag(stream, TAGS.landline, phone.landline || "", level + 1);
  stream.write(`${indent(level)}${TAGS.phoneEnd}${NEWLINE}`);
}

function writeFamily(stream, familyArray) {
  for (const f of familyArray) {
    stream.write(`${indent(2)}${TAGS.familyStart}${NEWLINE}`);
    writeXmlTag(stream, TAGS.name, f.name, 3);
    writeXmlTag(stream, TAGS.born, f.birthYear, 3);
    if (f.address) writeAddress(stream, f.address, 3);
    if (f.phone) writePhone(stream, f.phone, 3);
    stream.write(`${indent(2)}${TAGS.familyEnd}${NEWLINE}`);
  }
}

function writePerson(stream, person) {
  stream.write(`${indent(1)}${TAGS.personStart}${NEWLINE}`);
  writeXmlTag(stream, TAGS.firstName, person.firstName, 2);
  writeXmlTag(stream, TAGS.lastName, person.lastName, 2);
  if (person.address) writeAddress(stream, person.address, 2);
  if (person.phone) writePhone(stream, person.phone, 2);
  if (person.family.length > 0) writeFamily(stream, person.family);
  stream.write(`${indent(1)}${TAGS.personEnd}${NEWLINE}`);
}

function validateZip(zip) {
  if (!zip) return true;
  return /^[\d\s-]+$/.test(zip);
}

function validatePhoneNumber(number) {
  if (!number) return true;
  return /^[\d\- ]+$/.test(number);
}

class Converter {
  constructor(inputFile, outputFile) {
    this.inputFile = inputFile;
    this.outputFile = outputFile;

    this.people = [];
    this.currentPerson = null;
    this.currentFamilyMember = null;
  }

  async convert() {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.inputFile),
      crlfDelay: Infinity
    });

    const stream = fs.createWriteStream(this.outputFile, { encoding: "utf8" });
    stream.write(TAGS.rootStart);

    let lineNumber = 0;
    let lastType = null;

    for await (const line of rl) {
      lineNumber++;
      const parts = line.split("|").map(s => s.trim());
      const [type, ...rest] = parts;

      switch (type) {
        case "P":
          if (rest.length !== 2) throw new Error(`Expected 2 fields for 'P' on line ${lineNumber}: "${line}"`);
          if (this.currentPerson) {
            writePerson(stream, this.currentPerson);
          }
          this.currentPerson = new Person(rest[INDEX.P.firstName], rest[INDEX.P.lastName]);
          this.currentFamilyMember = null;
          break;

        case "F":
          if (!this.currentPerson) throw new Error(`'F' line without previous 'P' on line ${lineNumber}: "${line}"`);
          if (rest.length !== 2) throw new Error(`Expected 2 fields for 'F' on line ${lineNumber}: "${line}"`);
          const birthYear = rest[INDEX.F.born];
          if (!/^\d{4}$/.test(birthYear)) {
            throw new Error(`birthYear must be exactly 4 digits, got "${birthYear}" on line ${lineNumber}`);
          }
          this.currentFamilyMember = new FamilyMember(rest[INDEX.F.name], birthYear);
          this.currentPerson.family.push(this.currentFamilyMember);
          break;

        case "A":
          if (!this.currentPerson) throw new Error(`'A' line without previous 'P' on line ${lineNumber}: "${line}"`);
          if (rest.length !== 2 && rest.length !== 3) throw new Error(`Expected 2 or 3 fields for 'A' on line ${lineNumber}: "${line}"`);
          const zip = rest[INDEX.A.zip];
          if (!validateZip(zip)) {
            throw new Error(`Invalid zip format on line ${lineNumber}: "${zip}"`);
          }
          const address = new Address(rest[INDEX.A.street], rest[INDEX.A.city], zip);
          if (this.currentFamilyMember) {
            this.currentFamilyMember.address = address;
          } else {
            this.currentPerson.address = address;
          }
          break;

        case "T":
          if (!this.currentPerson) throw new Error(`'T' line without previous 'P' on line ${lineNumber}: "${line}"`);
          if (rest.length !== 2) throw new Error(`Expected 2 fields for 'T' on line ${lineNumber}: "${line}"`);
          const mobile = rest[INDEX.T.mobile];
          const landline = rest[INDEX.T.landline];
          if (!validatePhoneNumber(mobile)) {
            throw new Error(`Invalid mobile number format on line ${lineNumber}: "${mobile}"`);
          }
          if (!validatePhoneNumber(landline)) {
            throw new Error(`Invalid landline format on line ${lineNumber}: "${landline}"`);
          }
          const phone = new Phone(mobile, landline);
          if (this.currentFamilyMember) {
            this.currentFamilyMember.phone = phone;
          } else {
            this.currentPerson.phone = phone;
          }
          break;

        default:
          throw new Error(`Unknown line type '${type}' on line ${lineNumber}: "${line}"`);
      }

      const allowedAfter = {
        P: ["T", "A", "F"],
        F: ["T", "A"],
        T: ["A", "F", "P"],
        A: ["T", "F", "P"]
      };

      if (lastType && !allowedAfter[lastType].includes(type)) {
        throw new Error(`Invalid line type '${type}' after '${lastType}' on line ${lineNumber}: "${line}"`);
      }

      lastType = type;
    }

    if (this.currentPerson) {
      writePerson(stream, this.currentPerson);
    }

    stream.write(TAGS.rootEnd);
    stream.end();
  }
}

if (require.main === module) {
  const inputFile = "data/input.txt";
  const outputFile = "xml/output.xml";

  const converter = new Converter(inputFile, outputFile);
  converter.convert().then(() => {
    console.log(`Converting finished, found in: ${outputFile}`);
  }).catch(err => {
    console.error("Error during converting:", err.message);
  });
}

module.exports = {
  Converter,
  escapeXml,
  indent,
  writeXmlTag,
  writeAddress,
  writePhone,
  writeFamily,
  writePerson,
  validateZip,
  validatePhoneNumber,
  TAGS,
  INDEX,
  NEWLINE
};
