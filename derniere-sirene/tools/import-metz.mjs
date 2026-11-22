import {readFile,writeFile} from 'node:fs/promises';
import {convertOSM} from '../source/osm.mjs';

const inputs=process.argv.slice(2);
if(inputs.length!==4) throw Error('Indiquez les quatre extraits OSM.');
const docs=await Promise.all(inputs.map(async path=>JSON.parse(await readFile(path,'utf8'))));
const data=convertOSM(docs,{
  bounds:[6.155,49.104,6.197,49.126],w:97,h:78,meters:29,entry:[6.1846,49.1216],refuge:[6.1735,49.1121],
  labels:[
    ['LES ÎLES',6.1683,49.1222],['CENTRE-VILLE',6.1753,49.1168],['BELLECROIX',6.1916,49.1193],
    ['NOUVELLE VILLE',6.1678,49.1077],['MOSELLE',6.1607,49.1160],['PLANTIÈRES',6.1901,49.1091]
  ]
});
await writeFile(new URL('../maps/metz.json',import.meta.url),JSON.stringify(data)+'\n');
console.log(data.roads.length+' tronçons · '+data.buildings.length+' empreintes');
