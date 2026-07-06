import { Engine, Scene, Color4, Color3, MeshBuilder, StandardMaterial } from "@babylonjs/core";

export class App {
    // These need to be declared for the class to recognize them
    private _engine: Engine;
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    public async init(): Promise<void> {
        this._engine = new Engine(this._canvas, true, {
            stencil: true, 
            antialias: true, 
            adaptToDeviceRatio: true,
            preserveDrawingBuffer: false 
        });

        this._scene = new Scene(this._engine);
        this._scene.autoClear = true; 
        this._scene.autoClearDepthAndStencil = true;
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        await this._handleLoad();

        window.addEventListener("resize", () => this._engine?.resize());
        this._engine.runRenderLoop(() => {
            if (this._scene) {
                this._scene.render();
            }
        });
    }

    private async _handleLoad(): Promise<void> {
        // Use 'this._scene' instead of just 'scene'
        const scene = this._scene;

        const bgShield = MeshBuilder.CreateSphere("bgShield", { diameter: 500, segments: 16 }, scene);
        const shieldMat = new StandardMaterial("shieldMat", scene);
        shieldMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
        
        shieldMat.backFaceCulling = true; 
        shieldMat.sideOrientation = 1; 
        
        shieldMat.disableLighting = true;
        bgShield.material = shieldMat;
    }
}