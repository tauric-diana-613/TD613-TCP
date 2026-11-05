import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compileQualified} from './native/wendbine-native-method-adapter-v1.mjs';
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const result=await compileQualified({...input,compilerPath:fileURLToPath(new URL('./native/wendbine-compile.mjs',import.meta.url))});
process.stdout.write(JSON.stringify(result.native_output));
