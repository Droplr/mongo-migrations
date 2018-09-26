class Template {
  constructor(filePath, content) {
    this.filePath = filePath;
    this.content = content;

    return Object.preventExtensions(this);
  }
}

module.exports = Template;
