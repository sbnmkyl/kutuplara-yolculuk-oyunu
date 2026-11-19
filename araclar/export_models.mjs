// hafif/ klasöründeki üç modeli tek bir assets/models.js dosyasına dönüştürür.
// Böylece oyun dosya indirmeden (index.html'e çift tıklayınca bile) çalışır.
// Kullanım: node export_models.mjs
import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import fs from 'fs';

const io = new NodeIO();
const out = {};
// [oyundaki anahtar, dosya, doku boyutu, jpeg kalitesi]
const list = [['flag', 'hafif/penguin-flag.glb', 1024, 82], ['cute', 'hafif/penguin-cute.glb', 1024, 82], ['bear', 'hafif/polar-bear.glb', 512, 80]];
for (const [key, file, texSize, q] of list) {
  const doc = await io.read(file);
  const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
  const pos = prim.getAttribute('POSITION').getArray();
  const nor = prim.getAttribute('NORMAL').getArray();
  const uv = prim.getAttribute('TEXCOORD_0').getArray();
  const idx = prim.getIndices().getArray();
  const n = pos.length / 3;
  const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const v = pos[i * 3 + k]; if (v < min[k]) min[k] = v; if (v > max[k]) max[k] = v; }
  const size = max.map((v, k) => v - min[k]);
  const P = new Uint16Array(n * 3), N = new Int8Array(n * 3), T = new Uint16Array(n * 2);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) {
      P[i * 3 + k] = Math.round(((pos[i * 3 + k] - min[k]) / size[k]) * 65535);
      N[i * 3 + k] = Math.max(-127, Math.min(127, Math.round(nor[i * 3 + k] * 127)));
    }
    for (let k = 0; k < 2; k++) T[i * 2 + k] = Math.round(Math.min(1, Math.max(0, uv[i * 2 + k])) * 65535);
  }
  const I = n < 65536 ? new Uint16Array(idx) : new Uint32Array(idx);
  const jpg = await sharp(Buffer.from(prim.getMaterial().getBaseColorTexture().getImage())).resize(texSize, texSize).jpeg({ quality: q, mozjpeg: true }).toBuffer();
  const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
  out[key] = { n, tris: I.length / 3, size: size.map((v) => +(v / size[1]).toFixed(5)), i32: I instanceof Uint32Array, p: b64(P), nrm: b64(N), uv: b64(T), idx: b64(I), tex: 'data:image/jpeg;base64,' + jpg.toString('base64') };
  console.log(key, 'köşe:', n, 'üçgen:', I.length / 3);
}
fs.writeFileSync('../assets/models.js', '/* Meshy modellerinden üretilen hafif oyun modelleri (otomatik üretildi) */\nwindow.KBK_MODELS = ' + JSON.stringify(out) + ';\n');
console.log('assets/models.js yazıldı:', fs.statSync('../assets/models.js').size, 'bayt');
