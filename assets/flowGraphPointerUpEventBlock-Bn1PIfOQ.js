import { ap as FlowGraphEventBlock, R as RichTypeAny, aq as RichTypeNumber, ar as _IsDescendantOf, as as RegisterClass } from './index-BCisiVAF.js';

/** This file must only contain pure code and pure imports */
/**
 * A pointer up event block.
 * This block fires when a pointer is released (mouse button up / touch end).
 * Optionally filters to a specific mesh via the `targetMesh` input.
 */
class FlowGraphPointerUpEventBlock extends FlowGraphEventBlock {
    /**
     * Creates a new FlowGraphPointerUpEventBlock.
     * @param config optional configuration
     */
    constructor(config) {
        super(config);
        /** @internal */
        this.type = "PointerUp" /* FlowGraphEventType.PointerUp */;
        this.targetMesh = this.registerDataInput("targetMesh", RichTypeAny, config?.targetMesh);
        this.pointerId = this.registerDataOutput("pointerId", RichTypeNumber);
        this.pickedMesh = this.registerDataOutput("pickedMesh", RichTypeAny);
        this.pickedPoint = this.registerDataOutput("pickedPoint", RichTypeAny);
    }
    /** @internal */
    _executeEvent(context, pointerInfo) {
        const mesh = this.targetMesh.getValue(context);
        const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
        // If a target mesh is set, only fire when that mesh (or a descendant) is picked.
        if (mesh && !(pickedMesh === mesh || (pickedMesh && _IsDescendantOf(pickedMesh, mesh)))) {
            return true;
        }
        this.pointerId.setValue(pointerInfo.event.pointerId, context);
        this.pickedMesh.setValue(pickedMesh ?? null, context);
        this.pickedPoint.setValue(pointerInfo.pickInfo?.pickedPoint ?? null, context);
        this._execute(context);
        return !this.config?.stopPropagation;
    }
    /** @internal */
    _preparePendingTasks(_context) {
        // no-op
    }
    /** @internal */
    _cancelPendingTasks(_context) {
        // no-op
    }
    /**
     * @returns the class name of the block.
     */
    getClassName() {
        return "FlowGraphPointerUpEventBlock" /* FlowGraphBlockNames.PointerUpEvent */;
    }
}
let _Registered = false;
/**
 * Register side effects for flowGraphPointerUpEventBlock.
 * Safe to call multiple times; only the first call has an effect.
 */
function RegisterFlowGraphPointerUpEventBlock() {
    if (_Registered) {
        return;
    }
    _Registered = true;
    RegisterClass("FlowGraphPointerUpEventBlock" /* FlowGraphBlockNames.PointerUpEvent */, FlowGraphPointerUpEventBlock);
}

/**
 * Re-exports pure implementation and applies runtime side effects.
 * Import flowGraphPointerUpEventBlock.pure for tree-shakeable, side-effect-free usage.
 */
RegisterFlowGraphPointerUpEventBlock();

export { FlowGraphPointerUpEventBlock, RegisterFlowGraphPointerUpEventBlock };
