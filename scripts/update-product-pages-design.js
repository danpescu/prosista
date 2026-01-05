// Script to update all product pages to use the new design
// This script identifies pages that need updating and provides a template

const fs = require('fs');
const path = require('path');

const productPagesToUpdate = [
  'src/pages/produse/panouri-acustice-tapisate/canopy-acustic-lana-sticla.astro',
  'src/pages/produse/panouri-acustice-tapisate/panouri-perete-lana-sticla.astro',
  'src/pages/produse/panouri-acustice-tapisate/panouri-tavan-lana-sticla.astro',
  // Add more pages as needed
];

console.log('Pages that need updating:', productPagesToUpdate.length);
console.log('Run this script to see which pages need updating.');

