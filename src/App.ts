import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { SceneLoaderFlags } from "@babylonjs/core/Loading/sceneLoaderFlags";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { loadScene } from "babylonjs-editor-tools";
import { scriptsMap } from "./scripts";

export class App {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine | null = null;
    private _scene: Scene | null = null;

    constructor() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (!canvas) throw new Error("Canvas not found");
        this._canvas = canvas;
    }

    public async init(): Promise<void> {
        this._engine = new Engine(this._canvas, true, {
            stencil: true, antialias: true, adaptToDeviceRatio: true,
        });

        this._scene = new Scene(this._engine);
        this._scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

        await this._handleLoad();

        window.addEventListener("resize", () => this._engine?.resize());
        this._engine.runRenderLoop(() => this._scene?.render());
    }

    private async _handleLoad(): Promise<void> {
        if (!this._scene) return;
        const scene = this._scene;

        await loadScene("./scene/", "example.babylon", scene, scriptsMap, { quality: "high" });

        const touchCam = new ArcRotateCamera("flatScreenCamera", Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 2), scene);
        touchCam.minZ = 0.01;
        touchCam.maxZ = 1000.0;
        touchCam.angularSensibilityX = 1500;
        touchCam.angularSensibilityY = 1500;
        touchCam.pinchPrecision = 60;
        touchCam.panningSensibility = 1000;
        touchCam.lowerRadiusLimit = 2.5;
        touchCam.upperRadiusLimit = 15;

        scene.activeCamera = touchCam;
        touchCam.attachControl(this._canvas, true);

        const bgShield = MeshBuilder.CreateSphere("bgShield", { diameter: 500, segments: 16 }, scene);
        const shieldMat = new StandardMaterial("shieldMat", scene);
        shieldMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
        shieldMat.backFaceCulling = false;
        shieldMat.disableLighting = true;
        bgShield.material = shieldMat;
    }
}