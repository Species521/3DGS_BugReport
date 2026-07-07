const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/textureProcessor.fragment-Cn1ZLnrK.js","assets/index-DJWt-BPc.js","assets/index-Dzn_Fqi6.css","assets/textureProcessor.fragment-C9xCDKf3.js"])))=>i.map(i=>d[i]);
import { al as Color4, am as ProceduralTexture, an as __vitePreload, a as Color3 } from './index-DJWt-BPc.js';

const _ShaderName = "textureProcessor";
/**
 * Specifies the color space of a texture operand.
 * When `sRGB` is set the sampled RGB values are converted to linear space before any channel
 * swizzle, factor multiplication, or arithmetic operation. Alpha is always treated as linear.
 */
var TextureColorSpace;
(function (TextureColorSpace) {
    /** Texture data is already in linear space (default). No conversion applied. */
    TextureColorSpace[TextureColorSpace["Linear"] = 0] = "Linear";
    /** Texture data is in sRGB (gamma) space. RGB channels are linearized (IEC 61966-2-1) before use. */
    TextureColorSpace[TextureColorSpace["SRGB"] = 1] = "SRGB";
})(TextureColorSpace || (TextureColorSpace = {}));
/**
 * Bitmask controlling which channels are written to the output texture by a processing operation.
 * Channels excluded from the mask receive a sensible default: `0.0` for RGB channels, `1.0` for alpha.
 * Use `ChannelMask.RGBA` (or omit the parameter) to pass all channels through unchanged.
 *
 * | Flag | Channels written | Excluded channels |
 * |------|-----------------|-------------------|
 * | R    | red             | G=0, B=0, A=1     |
 * | G    | green           | R=0, B=0, A=1     |
 * | B    | blue            | R=0, G=0, A=1     |
 * | A    | alpha           | R=0, G=0, B=0     |
 * | RGB  | red, green, blue | A=1              |
 * | RGBA | all four        | (none)            |
 */
var ChannelMask;
(function (ChannelMask) {
    /** Pass only the red channel; G=0, B=0, A=1. */
    ChannelMask[ChannelMask["R"] = 1] = "R";
    /** Pass only the green channel; R=0, B=0, A=1. */
    ChannelMask[ChannelMask["G"] = 2] = "G";
    /** Pass only the blue channel; R=0, G=0, A=1. */
    ChannelMask[ChannelMask["B"] = 4] = "B";
    /** Pass only the alpha channel; R=0, G=0, B=0. */
    ChannelMask[ChannelMask["A"] = 8] = "A";
    /** Pass red, green, and blue; alpha is forced to 1.0. */
    ChannelMask[ChannelMask["RGB"] = 7] = "RGB";
    /** Pass all four channels unchanged (default — no masking). */
    ChannelMask[ChannelMask["RGBA"] = 15] = "RGBA";
})(ChannelMask || (ChannelMask = {}));
/**
 * Specifies which channel of a texture to read for an operation.
 * When a single channel is selected its scalar value is broadcast to RGB; alpha
 * is either preserved from the original sample or replicated when `A` is chosen.
 *
 * | Value | Swizzle |
 * |-------|---------|
 * | RGBA  | (r, g, b, a) — no swizzle (default) |
 * | R     | (r, r, r, a) |
 * | G     | (g, g, g, a) |
 * | B     | (b, b, b, a) |
 * | A     | (a, a, a, a) |
 */
var TextureChannel;
(function (TextureChannel) {
    /** Use all four channels as sampled (default). */
    TextureChannel[TextureChannel["RGBA"] = 0] = "RGBA";
    /** Broadcast the red channel to RGB; preserve alpha: RRRA. */
    TextureChannel[TextureChannel["R"] = 1] = "R";
    /** Broadcast the green channel to RGB; preserve alpha: GGGA. */
    TextureChannel[TextureChannel["G"] = 2] = "G";
    /** Broadcast the blue channel to RGB; preserve alpha: BBBA. */
    TextureChannel[TextureChannel["B"] = 3] = "B";
    /** Broadcast the alpha channel to all four components: AAAA. */
    TextureChannel[TextureChannel["A"] = 4] = "A";
})(TextureChannel || (TextureChannel = {}));
/**
 * Create an operand from a constant RGBA factor with no texture.
 * @param factor - The constant RGBA value
 * @returns An operand that evaluates to the constant factor
 */
function CreateFactorOperand(factor) {
    return { texture: null, factor };
}
/**
 * Create an operand from a texture multiplied by a constant RGBA factor.
 * This is the standard glTF pattern (e.g. baseColorTexture * baseColorFactor).
 * If `texture` is null, returns a factor-only operand.
 * @param texture - The texture to sample, or null to use the factor alone
 * @param factor - The constant factor to multiply by
 * @param channel - Optional channel selection. When set, the sampled value is swizzled before
 *   factor multiplication (e.g. `TextureChannel.G` → GGGA, then multiplied by factor).
 *   Defaults to `TextureChannel.RGBA` (no swizzle).
 * @param colorSpace - Optional color space. When `TextureColorSpace.SRGB`, the sampled RGB channels
 *   are linearized before factor multiplication. Defaults to `TextureColorSpace.Linear`.
 * @returns An operand that evaluates to `sample(texture) * factor`, or `factor` if texture is null
 */
function CreateTextureWithFactorOperand(texture, factor, channel, colorSpace) {
    const op = { texture, factor };
    if (channel) {
        op.channel = channel;
    }
    if (colorSpace) {
        op.colorSpace = colorSpace;
    }
    return op;
}
/**
 * @internal
 * Evaluate the effective constant Color4 of an operand.
 * When a texture-only operand omits factor, the implicit value is (1, 1, 1, 1).
 */
function _EvalConstant(op) {
    return op.factor ?? new Color4(1, 1, 1, 1);
}
/** @internal */
function _MultiplyConstants(a, b) {
    return new Color4(a.r * b.r, a.g * b.g, a.b * b.b, a.a * b.a);
}
/** @internal */
function _LerpConstants(a, b, t) {
    return new Color4(a.r + (b.r - a.r) * t.r, a.g + (b.g - a.g) * t.g, a.b + (b.b - a.b) * t.b, a.a + (b.a - a.a) * t.a);
}
/**
 * @internal
 * Determine the output texture size from a list of operands, using the largest input texture.
 */
function _ResolveOutputSize(operands) {
    let maxDim = 0;
    let result = 512;
    for (const op of operands) {
        if (op.texture) {
            const size = op.texture.getSize();
            const dim = Math.max(size.width, size.height);
            if (dim > maxDim) {
                maxDim = dim;
                result = size.width === size.height ? dim : size;
            }
        }
    }
    return result;
}
/**
 * @internal
 * Returns true when the texture has a non-identity UV transform (offset, scale, or rotation).
 */
function _HasNonIdentityTransform(texture) {
    return !texture.getTextureMatrix().isIdentity();
}
/**
 * @internal
 * Returns true when every texture in the list shares the same UV transform matrix.
 * A single texture (or empty list) trivially satisfies this.
 */
function _AllTransformsMatch(textures) {
    if (textures.length <= 1) {
        return true;
    }
    const ref = textures[0].getTextureMatrix();
    for (let i = 1; i < textures.length; i++) {
        if (!ref.equals(textures[i].getTextureMatrix())) {
            return false;
        }
    }
    return true;
}
/**
 * @internal
 * Copy sampling metadata from a source texture onto the output ProceduralTexture.
 * `coordinatesIndex` and wrap modes are always copied.
 * When `includeTransform` is true the UV offset/scale/rotation are also copied
 * (used when all inputs share the same transform and it is propagated rather than baked).
 */
function _CopyTextureMetadata(from, to, includeTransform) {
    to.coordinatesIndex = from.coordinatesIndex;
    to.wrapU = from.wrapU;
    to.wrapV = from.wrapV;
    if (includeTransform) {
        const src = from;
        to.uOffset = src.uOffset ?? 0;
        to.vOffset = src.vOffset ?? 0;
        to.uScale = src.uScale ?? 1;
        to.vScale = src.vScale ?? 1;
        to.wAng = src.wAng ?? 0;
    }
}
/**
 * @internal
 * Return the shader define suffix for a TextureChannel (e.g. TextureChannel.R → "R").
 * Returns an empty string for RGBA (no swizzle needed).
 */
function _ChannelDefine(channel) {
    switch (channel) {
        case TextureChannel.R:
            return "R";
        case TextureChannel.G:
            return "G";
        case TextureChannel.B:
            return "B";
        case TextureChannel.A:
            return "A";
        default:
            return "";
    }
}
/**
 * @internal
 * Apply a channel swizzle to a constant Color4, matching the GPU behaviour for TextureChannel.
 */
function _ApplyChannelSwizzle(c, channel) {
    switch (channel) {
        case TextureChannel.R:
            return new Color4(c.r, c.r, c.r, c.a);
        case TextureChannel.G:
            return new Color4(c.g, c.g, c.g, c.a);
        case TextureChannel.B:
            return new Color4(c.b, c.b, c.b, c.a);
        case TextureChannel.A:
            return new Color4(c.a, c.a, c.a, c.a);
        default:
            return c;
    }
}
/**
 * @internal
 * Build the OP_INVERT define plus per-channel INVERT_R/G/B/A defines from an ChannelMask bitmask.
 */
function _BuildInvertDefines(channels) {
    const defines = ["OP_INVERT"];
    if (channels & ChannelMask.R) {
        defines.push("INVERT_R");
    }
    if (channels & ChannelMask.G) {
        defines.push("INVERT_G");
    }
    if (channels & ChannelMask.B) {
        defines.push("INVERT_B");
    }
    if (channels & ChannelMask.A) {
        defines.push("INVERT_A");
    }
    return defines;
}
/**
 * @internal
 * Build OUTPUT_MASK_X_ZERO / OUTPUT_MASK_A_ONE defines for excluded channels.
 * Channels present in the mask pass through; excluded channels get defaults (0.0 for RGB, 1.0 for A).
 * Returns an empty array for ChannelMask.RGBA (no masking needed).
 */
function _BuildOutputChannelMaskDefines(mask) {
    const defines = [];
    if (!(mask & ChannelMask.R)) {
        defines.push("OUTPUT_MASK_R_ZERO");
    }
    if (!(mask & ChannelMask.G)) {
        defines.push("OUTPUT_MASK_G_ZERO");
    }
    if (!(mask & ChannelMask.B)) {
        defines.push("OUTPUT_MASK_B_ZERO");
    }
    if (!(mask & ChannelMask.A)) {
        defines.push("OUTPUT_MASK_A_ONE");
    }
    return defines;
}
/**
 * @internal
 * Apply a ChannelMask to a constant Color4: included channels pass through,
 * excluded color channels become 0, excluded alpha becomes 1.
 */
function _ApplyOutputChannelMask(c, mask) {
    return new Color4(mask & ChannelMask.R ? c.r : 0, mask & ChannelMask.G ? c.g : 0, mask & ChannelMask.B ? c.b : 0, mask & ChannelMask.A ? c.a : 1);
}
/**
 * @internal
 * Build shader defines for a standard A/B operand.
 * When `bakeTransform` is true and the texture has a non-identity UV transform,
 * the OPERAND_X_MATRIX define is emitted so the shader applies the matrix when sampling.
 */
function _BuildOperandDefines(operand, prefix, bakeTransform) {
    const defines = [];
    if (operand.texture) {
        defines.push(`OPERAND_${prefix}_TEXTURE`);
        if (bakeTransform && _HasNonIdentityTransform(operand.texture)) {
            defines.push(`OPERAND_${prefix}_MATRIX`);
        }
        if (operand.colorSpace) {
            defines.push(`OPERAND_${prefix}_SRGB`);
        }
        if (operand.channel) {
            defines.push(`OPERAND_${prefix}_CHANNEL_${_ChannelDefine(operand.channel)}`);
        }
    }
    if (operand.factor !== undefined || !operand.texture) {
        defines.push(`OPERAND_${prefix}_FACTOR`);
    }
    return defines;
}
/**
 * @internal
 * Build shader defines for the lerp blend operand.
 * When `bakeTransform` is true and the texture has a non-identity UV transform,
 * the LERP_T_MATRIX define is emitted.
 */
function _BuildLerpBlendDefines(t, bakeTransform) {
    const defines = [];
    if (t.texture) {
        defines.push("LERP_T_TEXTURE");
        if (bakeTransform && _HasNonIdentityTransform(t.texture)) {
            defines.push("LERP_T_MATRIX");
        }
        if (t.factor !== undefined) {
            defines.push("LERP_T_FACTOR");
        }
        if (t.colorSpace) {
            defines.push("LERP_T_SRGB");
        }
        if (t.channel) {
            defines.push(`LERP_T_CHANNEL_${_ChannelDefine(t.channel)}`);
        }
    }
    // factor-only: no additional defines needed; the shader uses factorT when LERP_T_TEXTURE is absent.
    return defines;
}
/**
 * @internal
 * Set uniforms and textures for a standard A/B operand on a procedural texture.
 * When `bakeTransform` is true and the texture has a non-identity UV matrix,
 * that matrix is uploaded as `<textureName>Matrix` for the shader to apply when sampling.
 */
function _SetOperandUniforms(pt, operand, textureName, factorName, bakeTransform) {
    if (operand.texture) {
        pt.setTexture(textureName, operand.texture);
        if (bakeTransform && _HasNonIdentityTransform(operand.texture)) {
            pt.setMatrix(`${textureName}Matrix`, operand.texture.getTextureMatrix());
        }
    }
    const needsFactor = operand.factor !== undefined || !operand.texture;
    if (needsFactor) {
        pt.setColor4(factorName, _EvalConstant(operand));
    }
}
/**
 * @internal
 * Set uniforms and textures for the lerp blend operand.
 * When `bakeTransform` is true and the texture has a non-identity UV matrix,
 * that matrix is uploaded as `textureTMatrix`.
 */
function _SetLerpBlendUniforms(pt, t, bakeTransform) {
    if (t.texture) {
        pt.setTexture("textureT", t.texture);
        if (bakeTransform && _HasNonIdentityTransform(t.texture)) {
            pt.setMatrix("textureTMatrix", t.texture.getTextureMatrix());
        }
        if (t.factor !== undefined) {
            pt.setColor4("factorT", t.factor);
        }
    }
    else {
        pt.setColor4("factorT", _EvalConstant(t));
    }
}
/**
 * @internal
 * Create a textureProcessor procedural texture with the given defines. The returned texture
 * is not yet rendered — uniforms must be set on it before calling _RenderAsync.
 */
function _CreateProcessorTexture(name, defines, outputSize, scene, outputColorSpace = TextureColorSpace.Linear) {
    const options = {
        type: 0,
        format: 5,
        samplingMode: 2,
        generateDepthBuffer: false,
        generateMipMaps: false,
        gammaSpace: outputColorSpace === TextureColorSpace.SRGB,
        shaderLanguage: scene.getEngine().isWebGPU ? 1 /* ShaderLanguage.WGSL */ : 0 /* ShaderLanguage.GLSL */,
        extraInitializationsAsync: async () => {
            if (scene.getEngine().isWebGPU) {
                await Promise.all([__vitePreload(() => import('./textureProcessor.fragment-Cn1ZLnrK.js'),true              ?__vite__mapDeps([0,1,2]):void 0)]);
            }
            else {
                await Promise.all([__vitePreload(() => import('./textureProcessor.fragment-C9xCDKf3.js'),true              ?__vite__mapDeps([3,1,2]):void 0)]);
            }
        },
        // Opt out of scene-managed rendering. _shouldRender() would re-render the texture
        // on the first scene frame regardless of refreshRate (because _currentRefreshId starts
        // at -1 and is only advanced by _shouldRender() itself, not by a direct render() call).
        // That re-render would sample already-disposed input textures, producing blank output.
        skipSceneRegistration: true,
    };
    const pt = new ProceduralTexture(name, outputSize, _ShaderName, scene, options);
    pt.refreshRate = -1; // render on demand only
    pt.defines = defines.length > 0 ? "#define " + defines.join("\n#define ") + "\n" : "";
    return pt;
}
/**
 * @internal
 * Wait for a procedural texture's shader to compile then render it. Uniforms must be set
 * on the texture before calling this.
 */
async function _RenderAsync(pt) {
    return await new Promise((resolve, reject) => {
        pt.executeWhenReady(() => {
            try {
                pt.render();
                resolve();
            }
            catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
    });
}
/**
 * Multiply two texture operands together, component-wise: `result = a * b`.
 *
 * Each operand can be a texture, a constant factor, or a texture scaled by a factor.
 * This is useful for applying glTF-style factors to textures (e.g. `baseColorTexture * baseColorFactor`),
 * or for modulating one texture by another.
 *
 * If both operands are constant (no textures), the multiplication is performed on the CPU and
 * the result is returned as a factor-only operand with no texture allocated.
 *
 * When operands are results of previous operations (i.e. they carry a `dispose` function),
 * their intermediate textures are automatically released after the GPU pass completes.
 *
 * @param name - Name for the resulting procedural texture (used only when a GPU pass is needed)
 * @param a - First operand
 * @param b - Second operand
 * @param scene - Scene to create the texture in (used only when a GPU pass is needed)
 * @param outputColorSpace - Optional output color space. When `TextureColorSpace.SRGB`, the linear
 *   result is converted to sRGB (IEC 61966-2-1) before being written. Defaults to `TextureColorSpace.Linear`.
 * @param outputChannelMask - Optional bitmask of channels to write. Excluded color channels are set to
 *   `0.0`; excluded alpha is set to `1.0`. Defaults to `ChannelMask.RGBA` (all channels written).
 * @returns An operand whose `texture` holds the GPU result, or whose `factor` holds the CPU-folded constant
 */
async function MultiplyTexturesAsync(name, a, b, scene, outputColorSpace, outputChannelMask) {
    if (!a.texture && !b.texture) {
        const factor = _MultiplyConstants(_EvalConstant(a), _EvalConstant(b));
        return { texture: null, factor: outputChannelMask ? _ApplyOutputChannelMask(factor, outputChannelMask) : factor };
    }
    const allTextures = [];
    if (a.texture) {
        allTextures.push(a.texture);
    }
    if (b.texture) {
        allTextures.push(b.texture);
    }
    const canPropagate = _AllTransformsMatch(allTextures);
    const bakeTransform = !canPropagate;
    const defines = [
        ..._BuildOperandDefines(a, "A", bakeTransform),
        ..._BuildOperandDefines(b, "B", bakeTransform),
        ...(outputChannelMask ? _BuildOutputChannelMaskDefines(outputChannelMask) : []),
    ];
    if (outputColorSpace) {
        defines.push("OUTPUT_SRGB");
    }
    const pt = _CreateProcessorTexture(name, defines, _ResolveOutputSize([a, b]), scene, outputColorSpace);
    _SetOperandUniforms(pt, a, "textureA", "factorA", bakeTransform);
    _SetOperandUniforms(pt, b, "textureB", "factorB", bakeTransform);
    try {
        await _RenderAsync(pt);
    }
    catch (error) {
        a.dispose?.();
        b.dispose?.();
        throw error;
    }
    a.dispose?.();
    b.dispose?.();
    _CopyTextureMetadata(allTextures[0], pt, canPropagate);
    const result = { texture: pt, dispose: () => pt.dispose() };
    if (outputColorSpace) {
        result.colorSpace = outputColorSpace;
    }
    return result;
}
/**
 * Linearly interpolate between two texture operands: `result = mix(a, b, t)`.
 *
 * Each operand can be a texture, a constant factor, or a texture scaled by a factor.
 * The `t` operand controls the blend weight per texel, per channel — a value of 0 returns `a`,
 * a value of 1 returns `b`. Use a grayscale texture or a scalar `Color4(v, v, v, v)` for
 * uniform blending across all channels.
 *
 * If all three operands are constant (no textures), the interpolation is performed on the CPU and
 * the result is returned as a factor-only operand with no texture allocated.
 *
 * When operands are results of previous operations (i.e. they carry a `dispose` function),
 * their intermediate textures are automatically released after the GPU pass completes.
 *
 * @param name - Name for the resulting procedural texture (used only when a GPU pass is needed)
 * @param a - Start value operand (returned when t = 0)
 * @param b - End value operand (returned when t = 1)
 * @param t - Blend weight operand. Each channel independently controls the blend for the corresponding output channel.
 * @param scene - Scene to create the texture in (used only when a GPU pass is needed)
 * @param outputColorSpace - Optional output color space. When `TextureColorSpace.SRGB`, the linear
 *   result is converted to sRGB (IEC 61966-2-1) before being written. Defaults to `TextureColorSpace.Linear`.
 * @param outputChannelMask - Optional bitmask of channels to write. Excluded color channels are set to
 *   `0.0`; excluded alpha is set to `1.0`. Defaults to `ChannelMask.RGBA` (all channels written).
 * @returns An operand whose `texture` holds the GPU result, or whose `factor` holds the CPU-folded constant
 */
async function LerpTexturesAsync(name, a, b, t, scene, outputColorSpace, outputChannelMask) {
    if (!a.texture && !b.texture && !t.texture) {
        const factor = _LerpConstants(_EvalConstant(a), _EvalConstant(b), _EvalConstant(t));
        return { texture: null, factor: outputChannelMask ? _ApplyOutputChannelMask(factor, outputChannelMask) : factor };
    }
    const allTextures = [];
    if (a.texture) {
        allTextures.push(a.texture);
    }
    if (b.texture) {
        allTextures.push(b.texture);
    }
    if (t.texture) {
        allTextures.push(t.texture);
    }
    const canPropagate = _AllTransformsMatch(allTextures);
    const bakeTransform = !canPropagate;
    const defines = [
        "OP_LERP",
        ..._BuildOperandDefines(a, "A", bakeTransform),
        ..._BuildOperandDefines(b, "B", bakeTransform),
        ..._BuildLerpBlendDefines(t, bakeTransform),
        ...(outputChannelMask ? _BuildOutputChannelMaskDefines(outputChannelMask) : []),
    ];
    if (outputColorSpace) {
        defines.push("OUTPUT_SRGB");
    }
    const pt = _CreateProcessorTexture(name, defines, _ResolveOutputSize([a, b, t]), scene, outputColorSpace);
    _SetOperandUniforms(pt, a, "textureA", "factorA", bakeTransform);
    _SetOperandUniforms(pt, b, "textureB", "factorB", bakeTransform);
    _SetLerpBlendUniforms(pt, t, bakeTransform);
    try {
        await _RenderAsync(pt);
    }
    catch (error) {
        a.dispose?.();
        b.dispose?.();
        t.dispose?.();
        throw error;
    }
    a.dispose?.();
    b.dispose?.();
    t.dispose?.();
    _CopyTextureMetadata(allTextures[0], pt, canPropagate);
    const result = { texture: pt, dispose: () => pt.dispose() };
    if (outputColorSpace) {
        result.colorSpace = outputColorSpace;
    }
    return result;
}
/**
 * Invert selected channels of a texture operand: `result[ch] = 1 - input[ch]`.
 *
 * The `channels` bitmask selects which channels are inverted; unselected channels pass through
 * unchanged. Use `ChannelMask.RGB` for the common roughness↔smoothness conversion, or
 * `ChannelMask.RGBA` (the default) to invert the entire texture.
 *
 * This is a unary operation — only operand A is used. Any `colorSpace` or `channel` properties
 * on the input operand are honoured (sRGB linearization and channel swizzle applied before
 * the invert).
 *
 * If the input is constant (no texture), the invert is performed on the CPU.
 *
 * When the input is the result of a previous operation (i.e. it carries a `dispose` function),
 * its intermediate texture is automatically released after the GPU pass completes.
 *
 * @param name - Name for the resulting procedural texture (used only when a GPU pass is needed)
 * @param input - Operand to invert
 * @param scene - Scene to create the texture in (used only when a GPU pass is needed)
 * @param channels - Bitmask of channels to invert. Defaults to `ChannelMask.RGBA`.
 * @param outputColorSpace - Optional output color space. When `TextureColorSpace.SRGB`, the linear
 *   result is converted to sRGB (IEC 61966-2-1) before being written. Defaults to `TextureColorSpace.Linear`.
 * @param outputChannelMask - Optional bitmask of channels to write. Excluded color channels are set to
 *   `0.0`; excluded alpha is set to `1.0`. Defaults to `ChannelMask.RGBA` (all channels written).
 * @returns An operand whose `texture` holds the GPU result, or whose `factor` holds the CPU-folded constant
 */
async function InvertTextureAsync(name, input, scene, channels = ChannelMask.RGBA, outputColorSpace, outputChannelMask) {
    if (!input.texture) {
        const c = _EvalConstant(input);
        const factor = new Color4(channels & ChannelMask.R ? 1 - c.r : c.r, channels & ChannelMask.G ? 1 - c.g : c.g, channels & ChannelMask.B ? 1 - c.b : c.b, channels & ChannelMask.A ? 1 - c.a : c.a);
        return { texture: null, factor: outputChannelMask ? _ApplyOutputChannelMask(factor, outputChannelMask) : factor };
    }
    // Single input: UV transform is always propagated (no bake needed).
    const defines = [..._BuildOperandDefines(input, "A", false), ..._BuildInvertDefines(channels), ...(outputChannelMask ? _BuildOutputChannelMaskDefines(outputChannelMask) : [])];
    if (outputColorSpace) {
        defines.push("OUTPUT_SRGB");
    }
    const pt = _CreateProcessorTexture(name, defines, _ResolveOutputSize([input]), scene, outputColorSpace);
    _SetOperandUniforms(pt, input, "textureA", "factorA", false);
    try {
        await _RenderAsync(pt);
    }
    catch (error) {
        input.dispose?.();
        throw error;
    }
    input.dispose?.();
    _CopyTextureMetadata(input.texture, pt, true);
    const result = { texture: pt, dispose: () => pt.dispose() };
    if (outputColorSpace) {
        result.colorSpace = outputColorSpace;
    }
    return result;
}
/**
 * Extract the per-texel maximum channel value from a texture and broadcast it to all output
 * channels, producing a single-value (greyscale) texture in a single GPU pass.
 *
 * For each texel, computes `max(r, g, b)` — or `max(r, g, b, a)` when `includeAlpha` is true —
 * and writes that scalar to the output:
 * - `includeAlpha = false` (default): output is `(m, m, m, a)` where `m = max(r, g, b)`
 * - `includeAlpha = true`:            output is `(m, m, m, m)` where `m = max(r, g, b, a)`
 *
 * This is more efficient than chaining `ExtractChannelAsync` calls through `MaxTexturesAsync`,
 * which would require multiple intermediate textures and GPU passes.
 *
 * Any `colorSpace` or `channel` properties on the input operand are honoured (sRGB linearization
 * and channel swizzle applied before the max reduction).
 *
 * If the input is constant (no texture), the reduction is performed on the CPU.
 *
 * When the input is the result of a previous operation (i.e. it carries a `dispose` function),
 * its intermediate texture is automatically released after the GPU pass completes.
 *
 * @param name - Name for the resulting procedural texture (used only when a GPU pass is needed)
 * @param input - Operand to reduce
 * @param scene - Scene to create the texture in (used only when a GPU pass is needed)
 * @param includeAlpha - When true, alpha participates in the max and is also set to the result.
 *   Defaults to false (alpha is preserved from the input).
 * @param outputColorSpace - Optional output color space. When `TextureColorSpace.SRGB`, the linear
 *   result is converted to sRGB (IEC 61966-2-1) before being written. Defaults to `TextureColorSpace.Linear`.
 * @param outputChannelMask - Optional bitmask of channels to write. Excluded color channels are set to
 *   `0.0`; excluded alpha is set to `1.0`. Defaults to `ChannelMask.RGBA` (all channels written).
 * @returns An operand whose `texture` holds the GPU result, or whose `factor` holds the CPU-folded constant
 */
async function ExtractMaxChannelAsync(name, input, scene, includeAlpha = false, outputColorSpace, outputChannelMask) {
    if (!input.texture) {
        const c = _EvalConstant(input);
        const m = includeAlpha ? Math.max(c.r, c.g, c.b, c.a) : Math.max(c.r, c.g, c.b);
        const factor = new Color4(m, m, m, includeAlpha ? m : c.a);
        return { texture: null, factor: outputChannelMask ? _ApplyOutputChannelMask(factor, outputChannelMask) : factor };
    }
    // Single input: UV transform is always propagated (no bake needed).
    const defines = [..._BuildOperandDefines(input, "A", false), "OP_CHANNEL_MAX", ...(outputChannelMask ? _BuildOutputChannelMaskDefines(outputChannelMask) : [])];
    if (includeAlpha) {
        defines.push("CHANNEL_MAX_INCLUDE_ALPHA");
    }
    if (outputColorSpace) {
        defines.push("OUTPUT_SRGB");
    }
    const pt = _CreateProcessorTexture(name, defines, _ResolveOutputSize([input]), scene, outputColorSpace);
    _SetOperandUniforms(pt, input, "textureA", "factorA", false);
    try {
        await _RenderAsync(pt);
    }
    catch (error) {
        input.dispose?.();
        throw error;
    }
    input.dispose?.();
    _CopyTextureMetadata(input.texture, pt, true);
    const result = { texture: pt, dispose: () => pt.dispose() };
    if (outputColorSpace) {
        result.colorSpace = outputColorSpace;
    }
    return result;
}
/**
 * Extract a single channel from a texture and broadcast it to RGB (or all four components for
 * `TextureChannel.A`), producing a new texture. This is a convenience wrapper over
 * `MultiplyTexturesAsync` with a `(1,1,1,1)` factor and the requested channel swizzle applied
 * to the input.
 *
 * Swizzle results per channel:
 * - `TextureChannel.R` → (r, r, r, a)
 * - `TextureChannel.G` → (g, g, g, a)
 * - `TextureChannel.B` → (b, b, b, a)
 * - `TextureChannel.A` → (a, a, a, a)
 *
 * If the input is constant (no texture), the swizzle is applied on the CPU.
 *
 * Any `colorSpace` property on the input operand is honoured (sRGB linearization applied before
 * the swizzle). Any existing `channel` on the input is replaced by the `channel` argument.
 *
 * When the input is the result of a previous operation (i.e. it carries a `dispose` function),
 * its intermediate texture is automatically released after the GPU pass completes.
 *
 * @param name - Name for the resulting procedural texture (used only when a GPU pass is needed)
 * @param input - Operand to extract the channel from
 * @param channel - The channel to extract and broadcast
 * @param scene - Scene to create the texture in (used only when a GPU pass is needed)
 * @param outputColorSpace - Optional output color space. When `TextureColorSpace.SRGB`, the linear
 *   result is converted to sRGB (IEC 61966-2-1) before being written. Defaults to `TextureColorSpace.Linear`.
 * @param outputChannelMask - Optional bitmask of channels to write. Excluded color channels are set to
 *   `0.0`; excluded alpha is set to `1.0`. Defaults to `ChannelMask.RGBA` (all channels written).
 * @returns An operand whose `texture` holds the GPU result, or whose `factor` holds the CPU-folded constant
 */
async function ExtractChannelAsync(name, input, channel, scene, outputColorSpace, outputChannelMask) {
    if (!input.texture) {
        const swizzled = _ApplyChannelSwizzle(_EvalConstant(input), channel);
        return { texture: null, factor: outputChannelMask ? _ApplyOutputChannelMask(swizzled, outputChannelMask) : swizzled };
    }
    return await MultiplyTexturesAsync(name, { ...input, channel }, CreateFactorOperand(new Color4(1, 1, 1, 1)), scene, outputColorSpace, outputChannelMask);
}

/**
 * Material Loading Adapter for OpenPBR materials that provides a unified OpenPBR-like interface.
 */
class OpenPBRMaterialLoadingAdapter {
    /**
     * Creates a new instance of the OpenPBRMaterialLoadingAdapter.
     * @param material - The OpenPBR material to adapt.
     */
    constructor(material) {
        this._specWorkflow = false;
        this._diffuseTransmissionTint = Color3.White();
        this._diffuseTransmissionTintTexture = null;
        this._material = material;
    }
    /**
     * Gets the underlying material
     */
    get material() {
        return this._material;
    }
    /**
     * Whether the material should be treated as unlit
     */
    get isUnlit() {
        return this._material.unlit;
    }
    /**
     * Sets whether the material should be treated as unlit
     */
    set isUnlit(value) {
        this._material.unlit = value;
    }
    // ========================================
    // CULLING PROPERTIES
    // ========================================
    /**
     * Sets whether back face culling is enabled.
     * @param value True to enable back face culling
     */
    set backFaceCulling(value) {
        this._material.backFaceCulling = value;
    }
    /**
     * Gets whether back face culling is enabled.
     * @returns True if back face culling is enabled
     */
    get backFaceCulling() {
        return this._material.backFaceCulling;
    }
    /**
     * Sets whether two-sided lighting is enabled.
     * @param value True to enable two-sided lighting
     */
    set twoSidedLighting(value) {
        this._material.twoSidedLighting = value;
    }
    /**
     * Gets whether two-sided lighting is enabled.
     * @returns True if two-sided lighting is enabled
     */
    get twoSidedLighting() {
        return this._material.twoSidedLighting;
    }
    // ========================================
    // ALPHA PROPERTIES
    // ========================================
    /**
     * Sets the alpha cutoff value for alpha testing.
     * Note: OpenPBR doesn't have a direct equivalent, so this is a no-op.
     * @param value The alpha cutoff threshold (ignored for OpenPBR)
     */
    set alphaCutOff(value) {
        // OpenPBR doesn't have a direct equivalent, but could be implemented if needed
    }
    /**
     * Gets the alpha cutoff value.
     * @returns Default value of 0.5 (OpenPBR doesn't support this directly)
     */
    get alphaCutOff() {
        return 0.5; // Default value
    }
    /**
     * Sets whether to use alpha from the base color texture.
     * Note: OpenPBR handles this differently through the baseColorTexture alpha channel.
     * @param value True to use alpha from base color texture (handled automatically in OpenPBR)
     */
    set useAlphaFromBaseColorTexture(value) {
        this._material._useAlphaFromBaseColorTexture = value;
    }
    /**
     * Gets whether alpha is used from the base color texture.
     * @returns Always false for OpenPBR as it's handled automatically
     */
    get useAlphaFromBaseColorTexture() {
        return false;
    }
    /**
     * Gets whether the transparency is treated as alpha coverage.
     */
    get transparencyAsAlphaCoverage() {
        // OpenPBR doesn't support treating transparency as alpha coverage.
        return false;
    }
    /**
     * Sets/Gets whether the transparency is treated as alpha coverage
     */
    set transparencyAsAlphaCoverage(value) {
        // OpenPBR doesn't support treating transparency as alpha coverage.
    }
    // ========================================
    // BASE PARAMETERS
    // ========================================
    /**
     * Sets the base color of the OpenPBR material.
     * @param value The base color as a Color3
     */
    set baseColor(value) {
        this._material.baseColor = value;
    }
    /**
     * Gets the base color of the OpenPBR material.
     * @returns The base color as a Color3
     */
    get baseColor() {
        return this._material.baseColor;
    }
    /**
     * Sets the base color texture of the OpenPBR material.
     * @param value The base color texture or null
     */
    set baseColorTexture(value) {
        this._material.baseColorTexture = value;
    }
    /**
     * Gets the base color texture of the OpenPBR material.
     * @returns The base color texture or null
     */
    get baseColorTexture() {
        return this._material.baseColorTexture;
    }
    /**
     * Sets the base diffuse roughness of the OpenPBR material.
     * @param value The diffuse roughness value (0-1)
     */
    set baseDiffuseRoughness(value) {
        this._material.baseDiffuseRoughness = value;
    }
    /**
     * Gets the base diffuse roughness of the OpenPBR material.
     * @returns The diffuse roughness value (0-1)
     */
    get baseDiffuseRoughness() {
        return this._material.baseDiffuseRoughness;
    }
    /**
     * Sets the base diffuse roughness texture of the OpenPBR material.
     * @param value The diffuse roughness texture or null
     */
    set baseDiffuseRoughnessTexture(value) {
        this._material.baseDiffuseRoughnessTexture = value;
    }
    /**
     * Gets the base diffuse roughness texture of the OpenPBR material.
     * @returns The diffuse roughness texture or null
     */
    get baseDiffuseRoughnessTexture() {
        return this._material.baseDiffuseRoughnessTexture;
    }
    /**
     * Sets the base metalness value of the OpenPBR material.
     * @param value The metalness value (0-1)
     */
    set baseMetalness(value) {
        this._material.baseMetalness = value;
    }
    /**
     * Gets the base metalness value of the OpenPBR material.
     * @returns The metalness value (0-1)
     */
    get baseMetalness() {
        return this._material.baseMetalness;
    }
    /**
     * Sets the base metalness texture of the OpenPBR material.
     * @param value The metalness texture or null
     */
    set baseMetalnessTexture(value) {
        this._material.baseMetalnessTexture = value;
    }
    /**
     * Gets the base metalness texture of the OpenPBR material.
     * @returns The metalness texture or null
     */
    get baseMetalnessTexture() {
        return this._material.baseMetalnessTexture;
    }
    /**
     * Sets whether to use roughness from the metallic texture's green channel.
     * @param value True to use green channel for roughness
     */
    set useRoughnessFromMetallicTextureGreen(value) {
        this._material._useRoughnessFromMetallicTextureGreen = value;
    }
    /**
     * Sets whether to use metalness from the metallic texture's blue channel.
     * @param value True to use blue channel for metalness
     */
    set useMetallicFromMetallicTextureBlue(value) {
        this._material._useMetallicFromMetallicTextureBlue = value;
    }
    // ========================================
    // SPECULAR PARAMETERS
    // ========================================
    /**
     * Configures specular properties for OpenPBR material.
     * @param _enableEdgeColor Whether to enable edge color support (ignored for OpenPBR)
     */
    enableSpecularEdgeColor(_enableEdgeColor = false) {
        // OpenPBR already supports edge color natively, no configuration needed
    }
    configureSpecularGlossiness() {
        this._specWorkflow = true;
    }
    /**
     * Sets the specular weight of the OpenPBR material.
     * @param value The specular weight value (0-1)
     */
    set specularWeight(value) {
        this._material.specularWeight = value;
    }
    /**
     * Gets the specular weight of the OpenPBR material.
     * @returns The specular weight value (0-1)
     */
    get specularWeight() {
        return this._material.specularWeight;
    }
    /**
     * Sets the specular weight texture of the OpenPBR material.
     * If the same texture is used for specular color, optimizes by using alpha channel for weight.
     * @param value The specular weight texture or null
     */
    set specularWeightTexture(value) {
        if (this._material.specularColorTexture === value) {
            this._material.specularWeightTexture = null;
            this._material._useSpecularWeightFromSpecularColorTexture = true;
            this._material._useSpecularWeightFromAlpha = true;
        }
        else {
            this._material.specularWeightTexture = value;
        }
    }
    /**
     * Gets the specular weight texture of the OpenPBR material.
     * @returns The specular weight texture or null
     */
    get specularWeightTexture() {
        return this._material.specularWeightTexture;
    }
    /**
     * Sets the specular color of the OpenPBR material.
     * @param value The specular color as a Color3
     */
    set specularColor(value) {
        this._material.specularColor = value;
    }
    /**
     * Gets the specular color of the OpenPBR material.
     * @returns The specular color as a Color3
     */
    get specularColor() {
        return this._material.specularColor;
    }
    /**
     * Sets the specular color texture of the OpenPBR material.
     * If the same texture is used for specular weight, optimizes by using alpha channel for weight.
     * @param value The specular color texture or null
     */
    set specularColorTexture(value) {
        this._material.specularColorTexture = value;
        if (this._material.specularWeightTexture === this._material.specularColorTexture) {
            this._material.specularWeightTexture = null;
            this._material._useSpecularWeightFromSpecularColorTexture = true;
            this._material._useSpecularWeightFromAlpha = true;
        }
    }
    /**
     * Gets the specular color texture of the OpenPBR material.
     * @returns The specular color texture or null
     */
    get specularColorTexture() {
        return this._material.specularColorTexture;
    }
    /**
     * Sets the specular roughness of the OpenPBR material.
     * @param value The roughness value (0-1)
     */
    set specularRoughness(value) {
        this._material.specularRoughness = value;
    }
    /**
     * Gets the specular roughness of the OpenPBR material.
     * @returns The roughness value (0-1)
     */
    get specularRoughness() {
        return this._material.specularRoughness;
    }
    /**
     * Sets the specular roughness texture of the OpenPBR material.
     * @param value The roughness texture or null
     */
    set specularRoughnessTexture(value) {
        this._material.specularRoughnessTexture = value;
    }
    /**
     * Gets the specular roughness texture of the OpenPBR material.
     * @returns The roughness texture or null
     */
    get specularRoughnessTexture() {
        return this._material.specularRoughnessTexture;
    }
    /**
     * Sets the specular index of refraction (IOR) of the OpenPBR material.
     * @param value The IOR value
     */
    set specularIor(value) {
        this._material.specularIor = value;
    }
    /**
     * Gets the specular index of refraction (IOR) of the OpenPBR material.
     * @returns The IOR value
     */
    get specularIor() {
        return this._material.specularIor;
    }
    /**
     * Sets the glossiness (inverted roughness) of the OpenPBR material.
     */
    set glossiness(value) {
        this._material.specularRoughness = Math.max(1.0 - value, 0.0);
    }
    get glossiness() {
        return 1.0 - this._material.specularRoughness;
    }
    // ========================================
    // EMISSION PARAMETERS
    // ========================================
    /**
     * Sets the emission color of the OpenPBR material.
     * @param value The emission color as a Color3
     */
    set emissionColor(value) {
        this._material.emissionColor = value;
    }
    /**
     * Gets the emission color of the OpenPBR material.
     * @returns The emission color as a Color3
     */
    get emissionColor() {
        return this._material.emissionColor;
    }
    /**
     * Sets the emission luminance of the OpenPBR material.
     * @param value The emission luminance value
     */
    set emissionLuminance(value) {
        this._material.emissionLuminance = value;
    }
    /**
     * Gets the emission luminance of the OpenPBR material.
     * @returns The emission luminance value
     */
    get emissionLuminance() {
        return this._material.emissionLuminance;
    }
    /**
     * Sets the emission color texture of the OpenPBR material.
     * @param value The emission texture or null
     */
    set emissionColorTexture(value) {
        this._material.emissionColorTexture = value;
    }
    /**
     * Gets the emission color texture of the OpenPBR material.
     * @returns The emission texture or null
     */
    get emissionColorTexture() {
        return this._material.emissionColorTexture;
    }
    // ========================================
    // AMBIENT OCCLUSION
    // ========================================
    /**
     * Sets the ambient occlusion texture of the OpenPBR material.
     * @param value The ambient occlusion texture or null
     */
    set ambientOcclusionTexture(value) {
        this._material.ambientOcclusionTexture = value;
    }
    /**
     * Gets the ambient occlusion texture of the OpenPBR material.
     * @returns The ambient occlusion texture or null
     */
    get ambientOcclusionTexture() {
        return this._material.ambientOcclusionTexture;
    }
    /**
     * Sets the ambient occlusion texture strength by modifying the texture's level.
     * @param value The strength value (typically 0-1)
     */
    set ambientOcclusionTextureStrength(value) {
        const texture = this._material.ambientOcclusionTexture;
        if (texture) {
            texture.level = value;
        }
    }
    /**
     * Gets the ambient occlusion texture strength from the texture's level property.
     * @returns The strength value, defaults to 1.0 if no texture or level is set
     */
    get ambientOcclusionTextureStrength() {
        const texture = this._material.ambientOcclusionTexture;
        return texture?.level ?? 1.0;
    }
    // ========================================
    // COAT PARAMETERS
    // ========================================
    /**
     * Configures coat parameters for OpenPBR material.
     * OpenPBR coat is already built-in, so no configuration is needed.
     */
    configureCoat() {
        // OpenPBR coat is already built-in, no configuration needed
    }
    /**
     * Sets the coat weight of the OpenPBR material.
     * @param value The coat weight value (0-1)
     */
    set coatWeight(value) {
        this._material.coatWeight = value;
    }
    /**
     * Gets the coat weight of the OpenPBR material.
     * @returns The coat weight value (0-1)
     */
    get coatWeight() {
        return this._material.coatWeight;
    }
    /**
     * Sets the coat weight texture of the OpenPBR material.
     * @param value The coat weight texture or null
     */
    set coatWeightTexture(value) {
        this._material.coatWeightTexture = value;
    }
    /**
     * Gets the coat weight texture of the OpenPBR material.
     * @returns The coat weight texture or null
     */
    get coatWeightTexture() {
        return this._material.coatWeightTexture;
    }
    /**
     * Sets the coat color of the OpenPBR material.
     * @param value The coat color as a Color3
     */
    set coatColor(value) {
        this._material.coatColor = value;
    }
    /**
     * Gets the coat color of the OpenPBR material.
     */
    get coatColor() {
        return this._material.coatColor;
    }
    /**
     * Sets the coat color texture of the OpenPBR material.
     * @param value The coat color texture or null
     */
    set coatColorTexture(value) {
        this._material.coatColorTexture = value;
    }
    /**
     * Sets the coat roughness of the OpenPBR material.
     * @param value The coat roughness value (0-1)
     */
    set coatRoughness(value) {
        this._material.coatRoughness = value;
    }
    /**
     * Gets the coat roughness of the OpenPBR material.
     * @returns The coat roughness value (0-1)
     */
    get coatRoughness() {
        return this._material.coatRoughness;
    }
    /**
     * Sets the coat roughness texture of the OpenPBR material.
     * @param value The coat roughness texture or null
     */
    set coatRoughnessTexture(value) {
        this._material.coatRoughnessTexture = value;
        if (value) {
            this._material._useCoatRoughnessFromGreenChannel = true;
        }
    }
    /**
     * Gets the coat roughness texture of the OpenPBR material.
     * @returns The coat roughness texture or null
     */
    get coatRoughnessTexture() {
        return this._material.coatRoughnessTexture;
    }
    /**
     * Sets the coat index of refraction (IOR) of the OpenPBR material.
     */
    set coatIor(value) {
        this._material.coatIor = value;
    }
    get coatIor() {
        return this._material.coatIor;
    }
    /**
     * Sets the coat darkening value of the OpenPBR material.
     * @param value The coat darkening value
     */
    set coatDarkening(value) {
        this._material.coatDarkening = value;
    }
    get coatDarkening() {
        return this._material.coatDarkening;
    }
    /**
     * Sets the coat darkening texture (OpenPBR: coatDarkeningTexture, no PBR equivalent)
     */
    set coatDarkeningTexture(value) {
        this._material.coatDarkeningTexture = value;
    }
    /**
     * Sets the coat roughness anisotropy.
     * TODO: Implementation pending OpenPBR coat anisotropy feature availability.
     * @param value The coat anisotropy intensity value
     */
    set coatRoughnessAnisotropy(value) {
        this._material.coatRoughnessAnisotropy = value;
    }
    /**
     * Gets the coat roughness anisotropy.
     * TODO: Implementation pending OpenPBR coat anisotropy feature availability.
     * @returns Currently returns 0 as coat anisotropy is not yet available
     */
    get coatRoughnessAnisotropy() {
        return this._material.coatRoughnessAnisotropy;
    }
    /**
     * Sets the coat tangent angle for anisotropy.
     * TODO: Implementation pending OpenPBR coat anisotropy feature availability.
     * @param value The coat anisotropy rotation angle in radians
     */
    set geometryCoatTangentAngle(value) {
        this._material.geometryCoatTangentAngle = value;
    }
    /**
     * Sets the coat tangent texture for anisotropy.
     * TODO: Implementation pending OpenPBR coat anisotropy feature availability.
     * @param value The coat anisotropy texture or null
     */
    set geometryCoatTangentTexture(value) {
        this._material.geometryCoatTangentTexture = value;
        if (value) {
            this._material._useCoatRoughnessAnisotropyFromTangentTexture = true;
        }
    }
    /**
     * Gets the coat tangent texture for anisotropy.
     * TODO: Implementation pending OpenPBR coat anisotropy feature availability.
     * @returns Currently returns null as coat anisotropy is not yet available
     */
    get geometryCoatTangentTexture() {
        return this._material.geometryCoatTangentTexture;
    }
    // ========================================
    // TRANSMISSION LAYER
    // ========================================
    /**
     * Configures transmission for OpenPBR material.
     */
    configureTransmission() {
        // Material is thin-walled until otherwise specified by the glTF volume extension.
        this._material.geometryThinWalled = 1.0;
        this._material.transmissionDepth = 0.0;
    }
    /**
     * Sets the transmission weight.
     * @param value The transmission weight value (0-1)
     */
    set transmissionWeight(value) {
        this._material.transmissionWeight = value;
    }
    /**
     * Sets the transmission weight texture.
     * @param value The transmission weight texture or null
     */
    set transmissionWeightTexture(value) {
        this._material.transmissionWeightTexture = value;
    }
    get transmissionWeightTexture() {
        return this._material.transmissionWeightTexture;
    }
    /**
     * Gets the transmission weight.
     * @returns Currently returns 0 as transmission is not yet available
     */
    get transmissionWeight() {
        return this._material.transmissionWeight;
    }
    /**
     * Sets the transmission scatter coefficient.
     * @param value The scatter coefficient as a Vector3
     */
    set transmissionScatter(value) {
        this._material.transmissionScatter = value;
    }
    /**
     * Gets the transmission scatter coefficient.
     * @returns The scatter coefficient as a Vector3
     */
    get transmissionScatter() {
        return this._material.transmissionScatter;
    }
    /**
     * Sets the transmission scatter texture.
     * @param value The transmission scatter texture or null
     */
    set transmissionScatterTexture(value) {
        this._material.transmissionScatterTexture = value;
    }
    /**
     * Gets the transmission scatter texture.
     * @returns The transmission scatter texture or null
     */
    get transmissionScatterTexture() {
        return this._material.transmissionScatterTexture;
    }
    /**
     * Sets the transmission scattering anisotropy.
     * @param value The anisotropy intensity value (-1 to 1)
     */
    set transmissionScatterAnisotropy(value) {
        this._material.transmissionScatterAnisotropy = value;
    }
    /**
     * Sets the transmission dispersion Abbe number.
     * @param value The Abbe number value
     */
    set transmissionDispersionAbbeNumber(value) {
        this._material.transmissionDispersionAbbeNumber = value;
    }
    /**
     * Sets the transmission dispersion scale.
     * @param value The dispersion scale value
     */
    set transmissionDispersionScale(value) {
        this._material.transmissionDispersionScale = value;
    }
    /**
     * Sets the attenuation distance.
     * @param value The attenuation distance value
     */
    set transmissionDepth(value) {
        // If the value is being set to the default max value, and the current transmission depth is 0,
        // we assume that attenuation color isn't used and keep it at 0 to allow
        // us to use constant transmission color to handle glTF's surface tint from base color.
        if (value !== Number.MAX_VALUE || this._material.transmissionDepth !== 0) {
            this._material.transmissionDepth = value;
        }
        else {
            this._material.transmissionDepth = 0;
        }
    }
    /**
     * Gets the attenuation distance.
     */
    get transmissionDepth() {
        return this._material.transmissionDepth;
    }
    /**
     * Sets the attenuation color.
     * @param value The attenuation color as a Color3
     */
    set transmissionColor(value) {
        // Only set the transmission color if it's not white (default)
        // This allows us to retain the base color as the transmission color,
        // if that was previously set.
        if (!value.equals(Color3.White())) {
            this._material.transmissionColor = value;
        }
    }
    /**
     * Gets the attenuation color.
     */
    get transmissionColor() {
        return this._material.transmissionColor;
    }
    /**
     * Gets the refraction background texture
     * @returns The refraction background texture or null
     */
    get refractionBackgroundTexture() {
        return this._material.backgroundRefractionTexture;
    }
    /**
     * Sets the refraction background texture
     * @param value The refraction background texture or null
     */
    set refractionBackgroundTexture(value) {
        this._material.backgroundRefractionTexture = value;
    }
    // ========================================
    // VOLUME PROPERTIES
    // ========================================
    /**
     * Configures volume properties for OpenPBR material.
     */
    configureVolume() {
        // If we're configuring volume, we assume the material is not thin-walled (i.e. it's volumetric).
        this._material.geometryThinWalled = 0.0;
    }
    /**
     * Sets whether the material is thin-walled (i.e. non-volumetric) or not.
     */
    set geometryThinWalled(value) {
        this._material.geometryThinWalled = value ? 1.0 : 0.0;
    }
    /**
     * Gets whether the material is thin-walled (i.e. non-volumetric) or not.
     */
    get geometryThinWalled() {
        return this._material.geometryThinWalled ? true : false;
    }
    /**
     * Sets the thickness texture.
     * @param value The thickness texture or null
     */
    set volumeThicknessTexture(value) {
        this._material.geometryThicknessTexture = value;
        this._material._useGeometryThicknessFromGreenChannel = true;
    }
    /**
     * Sets the thickness factor.
     * @param value The thickness value
     */
    set volumeThickness(value) {
        this._material.geometryThickness = value;
    }
    // ========================================
    // SUBSURFACE PROPERTIES (Subsurface Scattering)
    // ========================================
    /**
     * Configures subsurface properties for PBR material
     */
    configureSubsurface() {
        // glTF diffuse transmission is thin-walled (before volume extension is applied) will map to the subsurface slab and, without a
        this._material.geometryThinWalled = 1.0;
        this._material.subsurfaceScatterAnisotropy = 1.0;
    }
    /**
     * Sets the subsurface weight
     */
    set subsurfaceWeight(value) {
        this._material.subsurfaceWeight = value;
    }
    get subsurfaceWeight() {
        return this._material.subsurfaceWeight;
    }
    /**
     * Sets the subsurface weight texture
     */
    set subsurfaceWeightTexture(value) {
        this._material.subsurfaceWeightTexture = value;
        this._material._useSubsurfaceWeightFromTextureAlpha = true;
    }
    get subsurfaceWeightTexture() {
        return this._material.subsurfaceWeightTexture;
    }
    /**
     * Sets the subsurface color.
     * @param value The subsurface tint color as a Color3
     */
    set subsurfaceColor(value) {
        this._material.subsurfaceColor = value;
    }
    /**
     * Sets the subsurface color texture.
     * @param value The subsurface tint texture or null
     */
    set subsurfaceColorTexture(value) {
        this._material.subsurfaceColorTexture = value;
    }
    /**
     * Sets the diffuse transmission tint of the material
     */
    set diffuseTransmissionTint(value) {
        this._diffuseTransmissionTint = value;
    }
    /**
     * Gets the diffuse transmission tint of the material
     */
    get diffuseTransmissionTint() {
        return this._diffuseTransmissionTint;
    }
    /**
     * Sets the diffuse transmission tint texture of the material
     */
    set diffuseTransmissionTintTexture(value) {
        this._diffuseTransmissionTintTexture = value;
    }
    /**
     * Gets the subsurface radius for subsurface scattering.
     * subsurfaceRadiusScale * subsurfaceRadius gives the mean free path per color channel.
     */
    get subsurfaceRadius() {
        return this._material.subsurfaceRadius;
    }
    /**
     * Sets the subsurface radius for subsurface scattering.
     * subsurfaceRadiusScale * subsurfaceRadius gives the mean free path per color channel.
     * @param value The subsurface radius value
     */
    set subsurfaceRadius(value) {
        this._material.subsurfaceRadius = value;
    }
    /**
     * Gets the subsurface radius scale for subsurface scattering.
     * subsurfaceRadiusScale * subsurfaceRadius gives the mean free path per color channel.
     */
    get subsurfaceRadiusScale() {
        return this._material.subsurfaceRadiusScale;
    }
    /**
     * Sets the subsurface radius scale for subsurface scattering.
     * subsurfaceRadiusScale * subsurfaceRadius gives the mean free path per color channel.
     * @param value The subsurface radius scale as a Color3
     */
    set subsurfaceRadiusScale(value) {
        this._material.subsurfaceRadiusScale = value;
    }
    /**
     * Sets the subsurface scattering anisotropy.
     * @param value The anisotropy intensity value
     */
    set subsurfaceScatterAnisotropy(value) {
        this._material.subsurfaceScatterAnisotropy = value;
    }
    /**
     * Does this material have a translucent surface (i.e. either transmission or subsurface)?
     * @returns True if the material is translucent, false otherwise
     */
    isTranslucent() {
        return this.transmissionWeight > 0 || this.subsurfaceWeight > 0;
    }
    // ========================================
    // FUZZ LAYER (Sheen)
    // ========================================
    /**
     * Configures fuzz for OpenPBR.
     * Enables fuzz and sets up proper configuration.
     */
    configureFuzz() {
        // Currently no setup to do for OpenPBR
    }
    /**
     * Sets the fuzz weight.
     * @param value The fuzz weight value
     */
    set fuzzWeight(value) {
        this._material.fuzzWeight = value;
    }
    /**
     * Sets the fuzz weight texture.
     * @param value The fuzz weight texture or null
     */
    set fuzzWeightTexture(value) {
        this._material.fuzzWeightTexture = value;
    }
    /**
     * Sets the fuzz color.
     * @param value The fuzz color as a Color3
     */
    set fuzzColor(value) {
        this._material.fuzzColor = value;
    }
    /**
     * Sets the fuzz color texture.
     * @param value The fuzz color texture or null
     */
    set fuzzColorTexture(value) {
        this._material.fuzzColorTexture = value;
    }
    /**
     * Sets the fuzz roughness.
     * @param value The fuzz roughness value (0-1)
     */
    set fuzzRoughness(value) {
        this._material.fuzzRoughness = value;
    }
    /**
     * Sets the fuzz roughness texture.
     * @param value The fuzz roughness texture or null
     */
    set fuzzRoughnessTexture(value) {
        this._material.fuzzRoughnessTexture = value;
        this._material._useFuzzRoughnessFromTextureAlpha = true;
    }
    // ========================================
    // ANISOTROPY
    // ========================================
    /**
     * Sets the specular roughness anisotropy of the OpenPBR material.
     * @param value The anisotropy intensity value
     */
    set specularRoughnessAnisotropy(value) {
        this._material.specularRoughnessAnisotropy = value;
    }
    /**
     * Gets the specular roughness anisotropy of the OpenPBR material.
     * @returns The anisotropy intensity value
     */
    get specularRoughnessAnisotropy() {
        return this._material.specularRoughnessAnisotropy;
    }
    /**
     * Sets the anisotropy rotation angle.
     * @param value The anisotropy rotation angle in radians
     */
    set geometryTangentAngle(value) {
        this._material.geometryTangentAngle = value;
    }
    /**
     * Sets the geometry tangent texture for anisotropy.
     * Automatically enables using anisotropy from the tangent texture.
     * @param value The anisotropy texture or null
     */
    set geometryTangentTexture(value) {
        this._material.geometryTangentTexture = value;
        this._material._useSpecularRoughnessAnisotropyFromTangentTexture = true;
    }
    /**
     * Gets the geometry tangent texture for anisotropy.
     * @returns The anisotropy texture or null
     */
    get geometryTangentTexture() {
        return this._material.geometryTangentTexture;
    }
    /**
     * Configures glTF-style anisotropy for the OpenPBR material.
     * @param useGltfStyle Whether to use glTF-style anisotropy
     */
    configureGltfStyleAnisotropy(useGltfStyle = true) {
        this._material._useGltfStyleAnisotropy = useGltfStyle;
    }
    // ========================================
    // THIN FILM IRIDESCENCE
    // ========================================
    /**
     * Sets the thin film weight.
     * @param value The thin film weight value
     */
    set thinFilmWeight(value) {
        this._material.thinFilmWeight = value;
    }
    /**
     * Sets the thin film IOR.
     * @param value The thin film IOR value
     */
    set thinFilmIor(value) {
        this._material.thinFilmIor = value;
    }
    /**
     * Sets the thin film thickness minimum.
     * @param value The minimum thickness value in nanometers
     */
    set thinFilmThicknessMinimum(value) {
        this._material.thinFilmThicknessMin = value / 1000.0; // Convert to micrometers for OpenPBR
    }
    /**
     * Sets the thin film thickness maximum.
     * @param value The maximum thickness value in nanometers
     */
    set thinFilmThicknessMaximum(value) {
        this._material.thinFilmThickness = value / 1000.0; // Convert to micrometers for OpenPBR
    }
    /**
     * Sets the thin film weight texture.
     * @param value The thin film weight texture or null
     */
    set thinFilmWeightTexture(value) {
        this._material.thinFilmWeightTexture = value;
    }
    /**
     * Sets the thin film thickness texture.
     * @param value The thin film thickness texture or null
     */
    set thinFilmThicknessTexture(value) {
        this._material.thinFilmThicknessTexture = value;
        this._material._useThinFilmThicknessFromTextureGreen = true;
    }
    // ========================================
    // UNLIT MATERIALS
    // ========================================
    /**
     * Sets whether the OpenPBR material is unlit.
     * @param value True to make the material unlit
     */
    set unlit(value) {
        this._material.unlit = value;
    }
    // ========================================
    // GEOMETRY PARAMETERS
    // ========================================
    /**
     * Sets the geometry opacity of the OpenPBR material.
     * @param value The opacity value (0-1)
     */
    set geometryOpacity(value) {
        this._material.geometryOpacity = value;
    }
    /**
     * Gets the geometry opacity of the OpenPBR material.
     * @returns The opacity value (0-1)
     */
    get geometryOpacity() {
        return this._material.geometryOpacity;
    }
    /**
     * Sets the geometry normal texture of the OpenPBR material.
     * @param value The normal texture or null
     */
    set geometryNormalTexture(value) {
        this._material.geometryNormalTexture = value;
    }
    /**
     * Gets the geometry normal texture of the OpenPBR material.
     * @returns The normal texture or null
     */
    get geometryNormalTexture() {
        return this._material.geometryNormalTexture;
    }
    /**
     * Sets the normal map inversions for the OpenPBR material.
     * Note: OpenPBR may handle normal map inversions differently or may not need them.
     * @param invertX Whether to invert the normal map on the X axis (may be ignored)
     * @param invertY Whether to invert the normal map on the Y axis (may be ignored)
     */
    setNormalMapInversions(invertX, invertY) {
        // OpenPBR handles normal map inversions differently or may not need them
    }
    /**
     * Sets the geometry coat normal texture of the OpenPBR material.
     * @param value The coat normal texture or null
     */
    set geometryCoatNormalTexture(value) {
        this._material.geometryCoatNormalTexture = value;
    }
    /**
     * Gets the geometry coat normal texture of the OpenPBR material.
     * @returns The coat normal texture or null
     */
    get geometryCoatNormalTexture() {
        return this._material.geometryCoatNormalTexture;
    }
    /**
     * Sets the geometry coat normal texture scale.
     * @param value The scale value for the coat normal texture
     */
    set geometryCoatNormalTextureScale(value) {
        if (this._material.geometryCoatNormalTexture) {
            this._material.geometryCoatNormalTexture.level = value;
        }
    }
    /**
     * Finalizes material properties after all loading is complete.
     * @param loader The glTF loader; `loader._disposed` is polled between texture passes to bail early on dispose.
     */
    async finalizeAsync(loader) {
        // Do final configuration for the material to handle any interactions/dependencies between properties that we had to defer until all properties were loaded.
        // If the material is volumetric, we may need to create a coat layer to handle the surface tint.
        if ((this._diffuseTransmissionTint && !this._diffuseTransmissionTint.equals(Color3.White())) || this._diffuseTransmissionTintTexture) {
            if (this._material.geometryThinWalled) {
                // Use the subsurface slab for surface tinting.
                this.subsurfaceColor = this._diffuseTransmissionTint;
                this.subsurfaceColorTexture = this._diffuseTransmissionTintTexture;
            }
            else {
                // Otherwise, we have volumetric attenuation so we need to use the coat layer to preserve the base color tinting of glTF.
                await this.copySurfaceToCoatAsync(loader, this.subsurfaceWeight, this.subsurfaceWeightTexture, TextureChannel.A, this._diffuseTransmissionTint, this._diffuseTransmissionTintTexture, true);
                if (loader._disposed) {
                    return;
                }
            }
        }
        // If the material has transmission, we need to use the base color to tint the transmission.
        if (this.transmissionWeight > 0) {
            if (this._material.geometryThinWalled || this._material.transmissionDepth === 0) {
                // If the material is thin-walled or has no attenuation depth, we can use the base color as the transmission color directly.
                this._material.transmissionColor = this._material.baseColor;
                this._material.transmissionColorTexture = this._material.baseColorTexture;
            }
            else if (!this.baseColor.equals(Color3.White()) || this.baseColorTexture !== null) {
                // Otherwise, we have volumetric attenuation so we need to use the coat layer to preserve the base color tinting of glTF.
                await this.copySurfaceToCoatAsync(loader, this.transmissionWeight, this.transmissionWeightTexture, TextureChannel.R, this.baseColor, this.baseColorTexture, false);
                if (loader._disposed) {
                    return;
                }
            }
        }
        if (this._specWorkflow) {
            // To convert from spec-gloss to OpenPBR, we'll grab the specular color's alpha channel (which contains glossiness) and
            // invert it to get roughness.
            const newRoughnessTexture = await InvertTextureAsync("newRoughnessTexture (" + this._material.name + ")", await ExtractChannelAsync("glossiness (" + this._material.name + ")", CreateTextureWithFactorOperand(this.specularColorTexture, new Color4(this.specularColor.r, this.specularColor.g, this.specularColor.b, this.glossiness), TextureChannel.A, TextureColorSpace.Linear), TextureChannel.A, this._material.getScene(), TextureColorSpace.Linear, ChannelMask.R), this._material.getScene(), ChannelMask.R, TextureColorSpace.Linear, ChannelMask.R);
            if (loader._disposed) {
                newRoughnessTexture.texture?.dispose();
                return;
            }
            this.specularRoughnessTexture = newRoughnessTexture.texture;
            this.specularRoughness = newRoughnessTexture.factor ? newRoughnessTexture.factor.r : 1.0;
            // Metallic = max(linearize(specular).rgb). The specular texture is sRGB so we must
            // linearize it first (TextureColorSpace.SRGB). The factor is already linear per convention.
            // We store metallic as linear (no outputColorSpace) because it is a data/scalar value;
            // encoding it as sRGB would corrupt it when it is used as the lerp t below.
            const newMetallic = await ExtractMaxChannelAsync("metallicTexture (" + this._material.name + ")", CreateTextureWithFactorOperand(this.specularColorTexture, this.specularColor.toColor4(), TextureChannel.RGBA, TextureColorSpace.Linear), this._material.getScene(), false, TextureColorSpace.SRGB, ChannelMask.RGB);
            if (loader._disposed) {
                newMetallic.texture?.dispose();
                return;
            }
            this.baseMetalnessTexture = newMetallic.texture;
            this.baseMetalness = newMetallic.factor ? newMetallic.factor.r : 1.0;
            // base_color = lerp(diffuse, specular, metallic).
            // Strip dispose before passing newMetallic as t — its texture is already owned by the
            // material (baseMetalnessTexture) and must not be released after the lerp pass.
            const newBaseColor = await LerpTexturesAsync("newBaseColor (" + this._material.name + ")", CreateTextureWithFactorOperand(this.baseColorTexture, this.baseColor.toColor4(), TextureChannel.RGBA, TextureColorSpace.Linear), CreateTextureWithFactorOperand(this.specularColorTexture, this.specularColor.toColor4(), TextureChannel.RGBA, TextureColorSpace.Linear), { ...newMetallic, dispose: undefined, colorSpace: TextureColorSpace.Linear }, this._material.getScene(), TextureColorSpace.SRGB, ChannelMask.RGB);
            if (loader._disposed) {
                newBaseColor.texture?.dispose();
                return;
            }
            const oldBaseColorTexture = this.baseColorTexture;
            oldBaseColorTexture?.dispose();
            this.baseColorTexture = newBaseColor.texture;
            this.baseColor = newBaseColor.factor ? new Color3(newBaseColor.factor.r, newBaseColor.factor.g, newBaseColor.factor.b) : Color3.White();
            const oldSpecularColorTexture = this.specularColorTexture;
            oldSpecularColorTexture?.dispose();
            this.specularColorTexture = null;
        }
    }
    async copySurfaceToCoatAsync(loader, weight, weightTexture, weightTextureChannel, color, colorTexture, diffuseTransmission = false) {
        // Blend coat properties using:
        // New coat will cover all areas that previously had coat or transmission.
        //   new_coat_weight = max(weight, existing_coat_weight)
        // New coat color is the multiplication of the base color tint and the existing coat tint, each blended by their respective weights:
        //   new_coat_color  = lerp(white, existing_coat_color, existing_coat_weight)
        //                   * lerp(white, color, weight)
        // Snapshot the original coat properties before mutating them, so both lerps
        // use the pre-merge values (the first lerp blends the *existing* coat color
        // by the *existing* coat weight; we must not use the merged weight here).
        const origCoatWeight = this._material.coatWeight;
        const origCoatWeightTexture = this._material.coatWeightTexture;
        const origCoatColor = this._material.coatColor.clone();
        const origCoatColorTexture = this._material.coatColorTexture;
        const origCoatNormalTexture = this._material.geometryCoatNormalTexture;
        const origCoatWeightCol4 = new Color4(origCoatWeight, origCoatWeight, origCoatWeight, origCoatWeight);
        const weightCol4 = new Color4(weight, weight, weight, weight);
        this.coatWeightTexture = null;
        this.coatWeight = 1.0;
        const results = await Promise.allSettled([
            LerpTexturesAsync("lerpExistingCoat", CreateTextureWithFactorOperand(null, new Color4(1, 1, 1, 1)), CreateTextureWithFactorOperand(origCoatColorTexture, origCoatColor.toColor4(), TextureChannel.RGBA, TextureColorSpace.SRGB), CreateTextureWithFactorOperand(origCoatWeightTexture, origCoatWeightCol4, TextureChannel.R), this._material.getScene(), TextureColorSpace.SRGB),
            LerpTexturesAsync("lerpSurfaceColor", CreateTextureWithFactorOperand(null, new Color4(1, 1, 1, 1)), CreateTextureWithFactorOperand(colorTexture, color.toColor4(), TextureChannel.RGBA, TextureColorSpace.SRGB), CreateTextureWithFactorOperand(weightTexture, weightCol4, weightTextureChannel), this._material.getScene(), TextureColorSpace.SRGB),
        ]);
        const rejected = results.find((r) => r.status === "rejected");
        if (rejected) {
            for (const r of results) {
                if (r.status === "fulfilled") {
                    r.value.texture?.dispose();
                }
            }
            throw rejected.reason;
        }
        const [lerpCoatColor, lerpSurfaceColor] = results.map((r) => r.value);
        if (loader._disposed) {
            lerpCoatColor.texture?.dispose();
            lerpSurfaceColor.texture?.dispose();
            return;
        }
        const newCoatColor = await MultiplyTexturesAsync("newCoatColor (" + this._material.name + ")", lerpCoatColor, lerpSurfaceColor, this._material.getScene(), TextureColorSpace.SRGB);
        if (loader._disposed) {
            newCoatColor.texture?.dispose();
            return;
        }
        if (newCoatColor.texture) {
            this.coatColorTexture = newCoatColor.texture;
            this.coatColor = Color3.White();
        }
        else if (newCoatColor.factor) {
            this.coatColorTexture = null;
            this.coatColor.fromArray([newCoatColor.factor.r, newCoatColor.factor.g, newCoatColor.factor.b]);
        }
        const newCoatIor = await LerpTexturesAsync("newCoatIor (" + this._material.name + ")", CreateTextureWithFactorOperand(null, new Color4(this._material.specularIor, this._material.specularIor, this._material.specularIor, 1.0), TextureChannel.R), CreateTextureWithFactorOperand(null, new Color4(this.coatIor, this.coatIor, this.coatIor, 1.0), TextureChannel.R), CreateTextureWithFactorOperand(origCoatWeightTexture, origCoatWeightCol4, TextureChannel.R), this._material.getScene());
        if (loader._disposed) {
            newCoatIor.texture?.dispose();
            return;
        }
        this.coatIor = newCoatIor.factor ? newCoatIor.factor.r : this.coatIor;
        const newCoatRoughness = await LerpTexturesAsync("newCoatRoughness (" + this._material.name + ")", CreateTextureWithFactorOperand(this.specularRoughnessTexture, new Color4(this.specularRoughness, this.specularRoughness, this.specularRoughness, 1.0), TextureChannel.G), CreateTextureWithFactorOperand(this.coatRoughnessTexture, new Color4(this.coatRoughness, this.coatRoughness, this.coatRoughness, 1.0), TextureChannel.G), CreateTextureWithFactorOperand(origCoatWeightTexture, origCoatWeightCol4, TextureChannel.R), this._material.getScene());
        if (loader._disposed) {
            newCoatRoughness.texture?.dispose();
            return;
        }
        this.coatRoughness = newCoatRoughness.factor ? newCoatRoughness.factor.r : 1.0;
        this.coatRoughnessTexture = newCoatRoughness.texture;
        const newCoatDarkening = await LerpTexturesAsync("newCoatDarkening (" + this._material.name + ")", CreateTextureWithFactorOperand(null, new Color4(0, 0, 0, 1.0), TextureChannel.R), CreateTextureWithFactorOperand(null, new Color4(this.coatDarkening, this.coatDarkening, this.coatDarkening, 1.0), TextureChannel.R), CreateTextureWithFactorOperand(origCoatWeightTexture, origCoatWeightCol4, TextureChannel.R), this._material.getScene());
        if (loader._disposed) {
            newCoatDarkening.texture?.dispose();
            return;
        }
        this.coatDarkening = newCoatDarkening.factor ? newCoatDarkening.factor.r : this.coatDarkening;
        if (diffuseTransmission) {
            const newSpecularRoughness = await LerpTexturesAsync("newSpecularRoughness (" + this._material.name + ")", CreateTextureWithFactorOperand(this.specularRoughnessTexture, new Color4(this._material.specularRoughness, this._material.specularRoughness, this._material.specularRoughness, 1.0), TextureChannel.G), CreateTextureWithFactorOperand(null, new Color4(1, 1, 1, 1.0), TextureChannel.R), CreateTextureWithFactorOperand(weightTexture, weightCol4, weightTextureChannel), this._material.getScene());
            if (loader._disposed) {
                newSpecularRoughness.texture?.dispose();
                return;
            }
            this.specularRoughness = newSpecularRoughness.factor ? newSpecularRoughness.factor.r : 1.0;
            this.specularRoughnessTexture = newSpecularRoughness.texture;
        }
        if (origCoatNormalTexture || this.geometryNormalTexture) {
            const newCoatNormal = await LerpTexturesAsync("newCoatNormal (" + this._material.name + ")", CreateTextureWithFactorOperand(this.geometryNormalTexture, this.geometryNormalTexture ? new Color4(1, 1, 1, 1) : new Color4(0.5, 0.5, 1.0, 1.0), TextureChannel.RGBA), CreateTextureWithFactorOperand(origCoatNormalTexture, origCoatNormalTexture ? new Color4(1, 1, 1, 1) : new Color4(0.5, 0.5, 1.0, 1.0), TextureChannel.RGBA), CreateTextureWithFactorOperand(origCoatWeightTexture, origCoatWeightCol4, TextureChannel.R), this._material.getScene());
            if (loader._disposed) {
                newCoatNormal.texture?.dispose();
                return;
            }
            if (newCoatNormal.texture) {
                this.geometryCoatNormalTexture = newCoatNormal.texture;
            }
        }
    }
}

export { OpenPBRMaterialLoadingAdapter };
