import { h as ShaderStore, I as gaussianSplattingVertexDeclaration, J as sceneUboDeclaration, K as meshUboDeclaration, M as gaussianSplattingUboDeclaration, N as clipPlaneVertexDeclaration, O as fogVertexDeclaration, z as logDepthDeclaration, P as helperFunctions, Q as gaussianSplatting, W as clipPlaneVertex, X as fogVertex, Y as logDepthVertex } from './index-D6q7v7hF.js';

// Do not edit.
const name = "gaussianSplattingVertexShader";
const shader = `#include<__decl__gaussianSplattingVertex>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<logDepthDeclaration>
#include<helperFunctions>
uniform vec2 invViewport;uniform vec2 dataTextureSize;uniform vec2 focal;uniform float kernelSize;uniform vec3 eyePosition;uniform float alpha;
#if IS_COMPOUND
uniform mat4 partWorld[MAX_PART_COUNT];uniform float partVisibility[MAX_PART_COUNT];
#endif
uniform sampler2D covariancesATexture;uniform sampler2D covariancesBTexture;uniform sampler2D centersTexture;uniform sampler2D colorsTexture;
#if SH_DEGREE>0
uniform highp usampler2D shTexture0;
#endif
#if SH_DEGREE>1
uniform highp usampler2D shTexture1;
#endif
#if SH_DEGREE>2
uniform highp usampler2D shTexture2;
#endif
#if SH_DEGREE>3
uniform highp usampler2D shTexture3;uniform highp usampler2D shTexture4;
#endif
#if IS_COMPOUND
uniform sampler2D partIndicesTexture;
#endif
varying vec4 vColor;varying vec2 vPosition;
#define CUSTOM_VERTEX_DEFINITIONS
#include<gaussianSplatting>
void main () {
#define CUSTOM_VERTEX_MAIN_BEGIN
float splatIndex=getSplatIndex(int(position.z+0.5));Splat splat=readSplat(splatIndex);vec3 covA=splat.covA.xyz;vec3 covB=vec3(splat.covA.w,splat.covB.xy);
#if IS_COMPOUND
mat4 splatWorld=getPartWorld(splat.partIndex);
#else
mat4 splatWorld=world;
#endif
vec4 worldPos=splatWorld*vec4(splat.center.xyz,1.0);vColor=splat.color;vPosition=position.xy;
#if SH_DEGREE>0
mat3 worldRot=mat3(splatWorld);mat3 normWorldRot=inverseMat3(worldRot);vec3 eyeToSplatLocalSpace=normalize(normWorldRot*(worldPos.xyz-eyePosition));
#if defined(GS_DBG_ENABLED) && IS_COMPOUND
{vec4 _row3=texelFetch(dbgPartData,ivec2(int(splat.partIndex),3),0);
#if SH_DEGREE>3
float _so4=texelFetch(dbgPartData,ivec2(int(splat.partIndex),4),0).x;
#else
float _so4=1.0;
#endif
vColor.xyz=_row3.x*splat.color.xyz+computeSHWeighted(splat,eyeToSplatLocalSpace,_row3.y,_row3.z,_row3.w,_so4);}
#elif defined(GS_DBG_ENABLED) && GS_DBG_SH_DC==0
vColor.xyz=computeSH(splat,eyeToSplatLocalSpace);
#else
vColor.xyz=splat.color.xyz+computeSH(splat,eyeToSplatLocalSpace);
#endif
#else
#if defined(GS_DBG_ENABLED) && IS_COMPOUND
{float _shDc=texelFetch(dbgPartData,ivec2(int(splat.partIndex),3),0).x;vColor.xyz=_shDc*splat.color.xyz;}
#elif defined(GS_DBG_ENABLED) && GS_DBG_SH_DC==0
vColor.xyz=vec3(0.0);
#endif
#endif
vColor.w*=alpha;
#if IS_COMPOUND
vColor.w*=partVisibility[splat.partIndex];
#endif
vec2 scale=vec2(1.,1.);
#define CUSTOM_VERTEX_UPDATE
gl_Position=gaussianSplatting(position.xy,worldPos.xyz,scale,covA,covB,splatWorld,view,projection);
#include<clipPlaneVertex>
#include<fogVertex>
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`;
// Sideeffect
if (!ShaderStore.ShadersStore[name]) {
    ShaderStore.ShadersStore[name] = shader;
}
const includes = [gaussianSplattingVertexDeclaration, sceneUboDeclaration, meshUboDeclaration, gaussianSplattingUboDeclaration, clipPlaneVertexDeclaration, fogVertexDeclaration, logDepthDeclaration, helperFunctions, gaussianSplatting, clipPlaneVertex, fogVertex, logDepthVertex];
for (const inc of includes) {
    if (!ShaderStore.IncludesShadersStore[inc.name]) {
        ShaderStore.IncludesShadersStore[inc.name] = inc.shader;
    }
}
/** @internal */
const gaussianSplattingVertexShader = { name, shader };

export { gaussianSplattingVertexShader };
