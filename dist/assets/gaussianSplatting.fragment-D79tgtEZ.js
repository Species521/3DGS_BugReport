import { f as ShaderStore, w as clipPlaneFragmentDeclaration, x as logDepthDeclaration, y as fogFragmentDeclaration, z as logDepthFragment, A as fogFragment, B as gaussianSplattingFragmentDeclaration, C as clipPlaneFragment } from './index-CcOue4Oj.js';

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
