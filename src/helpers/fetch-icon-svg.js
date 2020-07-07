const fs = require('fs');
const path = require('path');

const fetchIconSvg = (icon) => {
  const iconContent = fs.readFileSync(path.resolve(__dirname, '..', 'icons', `${icon}.svg`), 'utf-8');

  return `
    <svg class="inline-block w-em h-em" viewBox="0 0 16 16" fill="currentColor">
      ${iconContent}
    </svg>
  `;
};

module.exports = fetchIconSvg;
