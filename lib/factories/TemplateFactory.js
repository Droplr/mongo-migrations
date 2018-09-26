const path = require('path');
const fs = require('fs');
const slug = require('slug');
const formatDate = require('dateformat');
const mkdirp = require('mkdirp');
const Promise = require('bluebird');
const Template = require('../models/Template');

class TemplateFactory {
  async create(
    name,
    extension,
    dateFormat,
    templateFilePath = path.join(__dirname, 'template.js'),
    migrationsDirectory = 'migrations'
  ) {
    const template = new Template();
    template.content = await this._loadTemplate(templateFilePath);

    await Promise.promisify(mkdirp)(migrationsDirectory);

    const formattedDate = dateFormat ? formatDate(new Date(), dateFormat) : Date.now();

    template.filePath = path.join(
      process.cwd(),
      migrationsDirectory,
      `${slug(formattedDate + (name ? `-${name}` : ''))}${extension}`
    );

    await Promise.promisify(fs.writeFile)(template.filePath, template.content);
    return template;
  }

  async _loadTemplate(tmpl) {
    return Promise.promisify(fs.readFile)(tmpl, { encoding: 'utf8' });
  };
}

module.exports = new TemplateFactory();
