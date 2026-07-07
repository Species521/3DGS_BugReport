import { h as ShaderStore, y as clipPlaneFragmentDeclaration, z as logDepthDeclaration, A as fogFragmentDeclaration, B as logDepthFragment, D as fogFragment, E as gaussianSplattingFragmentDeclaration, H as clipPlaneFragment } from './index-BOiKPPZB.js';

// Do not edit.
const name = "gaussianSplattingPixelShader";
const shader = `#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vec4 vColor;varying vec2 vPosition;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
void main () {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec4 finalColor=gaussianColor(vColor);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
gl_FragColor=finalColor;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;
// Sideeffect
if (!ShaderStore.ShadersStore[name]) {
    ShaderStore.ShadersStore[name] = shader;
}
const includes = [clipPlaneFragmentDeclaration, logDepthDeclaration, fogFragmentDeclaration, logDepthFragment, fogFragment, gaussianSplattingFragmentDeclaration, clipPlaneFragment];
for (const inc of includes) {
    if (!ShaderStore.IncludesShadersStore[inc.name]) {
        ShaderStore.IncludesShadersStore[inc.name] = inc.shader;
    }
}
/** @internal */
const gaussianSplattingPixelShader = { name, shader };

export { gaussianSplattingPixelShader };
