import { h as ShaderStore, i as clipPlaneFragmentDeclarationWGSL, l as logDepthDeclarationWGSL, j as fogFragmentDeclarationWGSL, k as logDepthFragmentWGSL, m as fogFragmentWGSL, n as gaussianSplattingFragmentDeclarationWGSL, o as clipPlaneFragmentWGSL } from './index-TU7WpHfr.js';

// Do not edit.
const name = "gaussianSplattingPixelShader";
const shader = `#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vColor: vec4f;varying vPosition: vec2f;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
var finalColor: vec4f=gaussianColor(input.vColor,input.vPosition);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
fragmentOutputs.color=finalColor;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;
// Sideeffect
if (!ShaderStore.ShadersStoreWGSL[name]) {
    ShaderStore.ShadersStoreWGSL[name] = shader;
}
const includes = [clipPlaneFragmentDeclarationWGSL, logDepthDeclarationWGSL, fogFragmentDeclarationWGSL, logDepthFragmentWGSL, fogFragmentWGSL, gaussianSplattingFragmentDeclarationWGSL, clipPlaneFragmentWGSL];
for (const inc of includes) {
    if (!ShaderStore.IncludesShadersStoreWGSL[inc.name]) {
        ShaderStore.IncludesShadersStoreWGSL[inc.name] = inc.shader;
    }
}
/** @internal */
const gaussianSplattingPixelShaderWGSL = { name, shader };

export { gaussianSplattingPixelShaderWGSL };
