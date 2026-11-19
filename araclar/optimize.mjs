// Bir Meshy GLB dosyasını oyun için hafifletir: üçgen sayısını düşürür, dokuyu küçültür.
// Kullanım: node optimize.mjs girdi.glb hafif/cikti.glb <oran 0-1> <doku boyutu> <jpeg kalitesi>
// Örnek:    node optimize.mjs penguen.glb hafif/penguin-cute.glb 0.05 1024 84
import { NodeIO } from '@gltf-transform/core';
import { weld, simplify, prune, dedup, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const [, , src, dst, ratioS, texS, qS] = process.argv;
if (!src || !dst) { console.log('Kullanım: node optimize.mjs girdi.glb cikti.glb 0.05 1024 84'); process.exit(1); }
const ratio = parseFloat(ratioS || '0.05'), tex = parseInt(texS || '1024', 10), quality = parseInt(qS || '84', 10);
const io = new NodeIO();
const doc = await io.read(src);
await MeshoptSimplifier.ready;
const root = doc.getRoot();
for (const mat of root.listMaterials()) {
  mat.setMetallicRoughnessTexture(null); mat.setNormalTexture(null); mat.setOcclusionTexture(null); mat.setEmissiveTexture(null);
  mat.setMetallicFactor(0); mat.setRoughnessFactor(0.82); mat.setDoubleSided(false);
}
await doc.transform(
  weld({}),
  ...(ratio < 1 ? [simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.02 })] : []),
  prune({ keepAttributes: false }),
  dedup(),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [tex, tex], quality }),
);
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  console.log(dst, 'köşe:', prim.getAttribute('POSITION').getCount(), 'üçgen:', prim.getIndices().getCount() / 3);
}
await io.write(dst, doc);
