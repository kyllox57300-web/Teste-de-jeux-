// Assemble tout le jeu (Three.js compris) en un seul fichier ../jeu.html qui marche sans internet
import {build} from 'esbuild';
import fs from 'fs';
const dev = process.argv.includes('--dev');
const res = await build({entryPoints:['src/main.js'], bundle:true, minify:!dev, format:'iife', write:false, target:'es2020', legalComments:'none', loader:{'.glb':'binary'}});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const page = fs.readFileSync('src/index.template.html', 'utf8').replace('/*__JS__*/', () => js);
fs.writeFileSync('../jeu.html', page);
console.log('jeu.html :', (page.length / 1e6).toFixed(2), 'Mo');
