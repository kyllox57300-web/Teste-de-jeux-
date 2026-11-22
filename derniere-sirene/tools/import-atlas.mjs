import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {convertOSM} from '../source/osm.mjs';

const cities={
  strasbourg:{
    bounds:[7.727,48.575,7.756,48.590],entry:[7.751,48.585],refuge:[7.735,48.581],
    labels:[['GRANDE ÎLE',7.746,48.582],['PETITE FRANCE',7.737,48.581],['ILL',7.744,48.577]]
  },
  lyon:{
    bounds:[4.814,45.747,4.845,45.771],entry:[4.837,45.765],refuge:[4.822,45.754],
    labels:[['PRESQU’ÎLE',4.833,45.755],['VIEUX LYON',4.826,45.761],['RHÔNE',4.839,45.75],['SAÔNE',4.828,45.753]]
  },
  bordeaux:{
    bounds:[-.588,44.835,-.555,44.854],entry:[-.558,44.844],refuge:[-.580,44.841],
    labels:[['BASTIDE',-.559,44.848],['GARONNE',-.563,44.850],['SAINT-PIERRE',-.571,44.839],['QUINCONCES',-.576,44.846]]
  },
  dunkerque:{
    bounds:[2.356,51.025,2.391,51.045],entry:[2.373,51.040],refuge:[2.387,51.034],
    labels:[['VIEUX PORT',2.369,51.040],['CITADELLE',2.373,51.039],['BASSE VILLE',2.376,51.030],['BASSIN DU COMMERCE',2.372,51.036]]
  },
  toulouse:{
    bounds:[1.424,43.588,1.456,43.608],entry:[1.447,43.598],refuge:[1.433,43.601],
    labels:[['SAINT-CYPRIEN',1.433,43.598],['GARONNE',1.438,43.603],['CARMES',1.445,43.596],['CAPITOLE',1.446,43.604]]
  }
};
for(const name of process.argv.slice(2).length?process.argv.slice(2):Object.keys(cities)) {
  if(!Object.hasOwn(cities,name)) throw Error('Ville inconnue : '+name);
  const docs=[];
  for(let part=0;part<4;part++) {
    const path=join(tmpdir(),'sirene-area-'+name+'-'+part+'.json');
    docs.push(JSON.parse(await readFile(path,'utf8')));
  }
  const data=convertOSM(docs,cities[name]);
  await writeFile(new URL('../maps/'+name+'.json',import.meta.url),JSON.stringify(data)+'\n');
  console.log(name,data.w,data.h,data.roads.length,data.buildings.length,data.water.length,data.cells.split('4').length-1);
}
