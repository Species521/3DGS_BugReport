import { h as ShaderStore, s as sceneUboDeclarationWGSL, p as meshUboDeclarationWGSL } from './index-D6q7v7hF.js';

// Do not edit.
const name = "volumetricLightingRenderVolumeVertexShader";
const shader = `#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute position : vec3f;varying vWorldPos: vec4f;@vertex
fn main(input : VertexInputs)->FragmentInputs {let worldPos=mesh.world*vec4f(vertexInputs.position,1.0);vertexOutputs.vWorldPos=worldPos;vertexOutputs.position=scene.viewProjection*worldPos;}
`;
// Sideeffect
if (!ShaderStore.ShadersStoreWGSL[name]) {
    ShaderStore.ShadersStoreWGSL[name] = shader;
}
const includes = [sceneUboDeclarationWGSL, meshUboDeclarationWGSL];
for (const inc of includes) {
    if (!ShaderStore.IncludesShadersStoreWGSL[inc.name]) {
        ShaderStore.IncludesShadersStoreWGSL[inc.name] = inc.shader;
    }
}
/** @internal */
const volumetricLightingRenderVolumeVertexShaderWGSL = { name, shader };

export { volumetricLightingRenderVolumeVertexShaderWGSL };
