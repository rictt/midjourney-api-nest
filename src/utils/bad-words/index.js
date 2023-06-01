const fs = require('fs');
const path = require('path');
const readline = require('readline');

const words = [];
const getWords = () => {
  const files = fs.readdirSync(path.join(__dirname, './libs/'));
  files.forEach((file) => {
    if (path.extname(file) === '.txt') {
      const data = fs.readFileSync(path.join(__dirname, './libs/', file), 'utf-8').split('\n').map(e => e.replace(/(,|\r)/, ''))
      words.push(...data)
    }
  });

  fs.writeFileSync(path.join(__dirname, './sensitive-words.json'), JSON.stringify(words, null, 2))
};

getWords();