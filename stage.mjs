import fs from 'node:fs';
const stage=process.argv[2];
const allowed=['baseline','feature-native','feature-merged','manual','doloc'];
if(!allowed.includes(stage))throw Error('Choose: '+allowed.join(', '));
for(const [name,destination] of [['app.html','src/app.html'],['messages.xlf','src/locale/messages.xlf'],['messages.de.xlf','src/locale/messages.de.xlf'],['angular.json','angular.json']])fs.copyFileSync(`stages/${stage}/${name}`,destination);
console.log(`Restored ${stage}. This overwrites the demo template, translation files, and angular.json.`);
