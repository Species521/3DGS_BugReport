import { h as ShaderStore } from './index-BCisiVAF.js';

// Do not edit.
const name = "oitFinalSimpleBlendPixelShader";
const shader = `precision highp float;uniform sampler2D uFrontColor;void main() {ivec2 fragCoord=ivec2(gl_FragCoord.xy);vec4 frontColor=texelFetch(uFrontColor,fragCoord,0);glFragColor=frontColor;}
`;
// Sideeffect
if (!ShaderStore.ShadersStore[name]) {
    ShaderStore.ShadersStore[name] = shader;
}
/** @internal */
const oitFinalSimpleBlendPixelShader = { name, shader };

export { oitFinalSimpleBlendPixelShader };
