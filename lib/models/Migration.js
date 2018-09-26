class Migration {
  constructor(title, up, down, description) {
    this.title = title;
    this.up = up;
    this.down = down;
    this.description = description;
    this.timestamp = null;

    return Object.preventExtensions(this);
  }
}

module.exports = Migration;
