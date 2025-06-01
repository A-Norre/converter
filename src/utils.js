const NEWLINE = "\n";
const INDENT_SIZE = 2;

const TAGS = {
  rootStart: `<?xml version="1.0" encoding="UTF-8"?>${NEWLINE}<people>${NEWLINE}`,
  rootEnd: `</people>${NEWLINE}`,
  person: "person",
  address: "address",
  phone: "phone",
  family: "family",
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

function writeXmlElement(stream, tagName, value, level) {
  const ind = indent(level);
  if (value === null || value === undefined || value === "") {
    stream.write(`${ind}<${tagName} />${NEWLINE}`);
  } else {
    stream.write(`${ind}<${tagName}>${validateXml(value)}</${tagName}>${NEWLINE}`);
  }
}

function writeAddress(stream, address, level) {
  stream.write(`${indent(level)}<${TAGS.address}>${NEWLINE}`);
  writeXmlElement(stream, TAGS.street, address.street || "", level + 1);
  writeXmlElement(stream, TAGS.city, address.city || "", level + 1);
  writeXmlElement(stream, TAGS.zip, address.zip || "", level + 1);
  stream.write(`${indent(level)}</${TAGS.address}>${NEWLINE}`);
}

function writePhone(stream, phone, level) {
  stream.write(`${indent(level)}<${TAGS.phone}>${NEWLINE}`);
  writeXmlElement(stream, TAGS.mobile, phone.mobile || "", level + 1);
  writeXmlElement(stream, TAGS.landline, phone.landline || "", level + 1);
  stream.write(`${indent(level)}</${TAGS.phone}>${NEWLINE}`);
}

function writeFamily(stream, familyArray) {
  for (const f of familyArray) {
    stream.write(`${indent(2)}<${TAGS.family}>${NEWLINE}`);
    writeXmlElement(stream, TAGS.name, f.name, 3);
    writeXmlElement(stream, TAGS.born, f.birthYear, 3);
    if (f.address) writeAddress(stream, f.address, 3);
    if (f.phone) writePhone(stream, f.phone, 3);
    stream.write(`${indent(2)}</${TAGS.family}>${NEWLINE}`);
  }
}

function writePerson(stream, person) {
  stream.write(`${indent(1)}<${TAGS.person}>${NEWLINE}`);
  writeXmlElement(stream, TAGS.firstName, person.firstName, 2);
  writeXmlElement(stream, TAGS.lastName, person.lastName, 2);
  if (person.address) writeAddress(stream, person.address, 2);
  if (person.phone) writePhone(stream, person.phone, 2);
  if (person.family.length > 0) writeFamily(stream, person.family);
  stream.write(`${indent(1)}</${TAGS.person}>${NEWLINE}`);
}

function validateXml(text) {
  if (text === null || text === undefined) return "";
  const str = String(text);
  const illegalSymbols = /[&<>"'#()[\]{}$%*^=~`\\|@]|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF]/;
  if (illegalSymbols.test(str)) {
    throw new Error(`Unaccepted characters in XML: "${str}"`);
  }
  return str;
}

function validateZip(zip) {
  if (!zip) return true;
  return /^[\d\s-]+$/.test(zip);
}

function validatePhoneNumber(number) {
  if (!number) return true;
  return /^[\d\- ]+$/.test(number);
}

module.exports = {
  NEWLINE,
  TAGS,
  INDEX,
  indent,
  validateXml,
  writeXmlElement,
  writeAddress,
  writePhone,
  writeFamily,
  writePerson,
  validateZip,
  validatePhoneNumber
};
