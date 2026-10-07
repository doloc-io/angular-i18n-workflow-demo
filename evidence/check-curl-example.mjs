// Exercise the real demo script against a local HTTP error; never contact doloc.
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'doloc-curl-example-'));
const original=await fs.readFile(path.join(root,'stages/feature-merged/messages.de.xlf'));
const file='src/locale/messages.de.xlf';
await fs.mkdir(path.join(dir,'src/locale'),{recursive:true});
await fs.mkdir(path.join(dir,'bin'));
await fs.writeFile(path.join(dir,file),original);
function run(cmd,args,env=process.env){return new Promise((resolve,reject)=>{const p=spawn(cmd,args,{cwd:dir,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);p.on('error',reject);p.on('exit',code=>resolve({code,stdout,stderr}));});}
let server;
try{
 const curlPath=await run('bash',['-c','command -v curl']);if(curlPath.code)throw Error('curl not found');
 for(const args of [['init','--quiet'],['add',file],['-c','user.name=Local verification','-c','user.email=verification@example.invalid','commit','--quiet','-m','Preserve merged translations before overwrite']]){const result=await run('git',args);if(result.code)throw Error(result.stderr);}
 // PATH shim changes only the endpoint; all actual curl-example.sh arguments stay intact.
 await fs.writeFile(path.join(dir,'bin/curl'),`#!/usr/bin/env node\nconst{spawnSync}=require('node:child_process');const args=process.argv.slice(2).map(a=>a==='https://api.doloc.io'?process.env.TEST_ENDPOINT:a);const r=spawnSync(process.env.REAL_CURL,args,{stdio:'inherit'});process.exit(r.status??1);\n`,{mode:0o755});
 let received;const errorBody=JSON.stringify({error:'Controlled local test: invalid request'})+'\n';
 server=http.createServer(async(req,res)=>{const chunks=[];for await(const chunk of req)chunks.push(chunk);received=Buffer.concat(chunks);res.writeHead(400,{'content-type':'application/json'});res.end(errorBody);});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const result=await run('bash',[path.join(root,'curl-example.sh')],{...process.env,PATH:path.join(dir,'bin')+path.delimiter+process.env.PATH,API_TOKEN:'local-test-placeholder',REAL_CURL:curlPath.stdout.trim(),TEST_ENDPOINT:`http://127.0.0.1:${server.address().port}/`});
 const overwritten=await fs.readFile(path.join(dir,file),'utf8');
 const restored=await run('git',['restore','--',file]);
 const recovered=await fs.readFile(path.join(dir,file));
 const report={date:'2026-10-07',test:'Actual curl-example.sh against controlled local HTTP 400; no doloc API request',scriptSha256:createHash('sha256').update(await fs.readFile(path.join(root,'curl-example.sh'))).digest('hex'),curlFlag:'--fail-with-body',httpStatus:400,curlExitCode:result.code,requestWasCompleteOriginal:received?.equals(original)??false,outputContainsErrorBody:overwritten===errorBody,noFalseSuccessMessage:!result.stdout.includes('Translations updated'),gitRestoreExitCode:restored.code,restoredBytesMatchCommittedTranslations:recovered.equals(original),originalSha256:createHash('sha256').update(original).digest('hex'),conclusion:'Inspect the saved HTTP error response, then restore committed translations from Git before retrying.'};
 if(result.code!==22||!report.requestWasCompleteOriginal||!report.outputContainsErrorBody||!report.noFalseSuccessMessage||!report.restoredBytesMatchCommittedTranslations)throw Error(JSON.stringify(report));
 await fs.writeFile(path.join(root,'evidence/fail-with-body-local-check.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}finally{server?.close();await fs.rm(dir,{recursive:true,force:true});}
