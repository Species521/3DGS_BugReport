import { TransformNode, ImportMeshAsync, Vector3, Mesh } from "@babylonjs/core";
import "@babylonjs/loaders/SPLAT/splatFileLoader";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Image } from "@babylonjs/gui/2D/controls/image";

export default class SplatLoaderScript {
    private _attachedNode: TransformNode;
    private _currentSplat: Mesh | null = null;
    private _currentIndex: number = 0;
    private _urls: string[] = [
        "https://github.com/Species521/3DGS_storage/blob/main/clusterFly_M.ply",
        "https://github.com/Species521/3DGS_storage/blob/main/Carabus_cancellatus_oligoscythus_bukowiniacus/Carabus_cancellatus_oligoscythus_bukowiniacus_med_noPin.ply",
        "https://github.com/Species521/3DGS_storage/blob/main/Ixodes_holocyclus/Ixodes_holocyclus_Mid_noPin.ply"
    ];

    constructor(attachedNode: TransformNode) { this._attachedNode = attachedNode; }

    public async onStart(): Promise<void> {
        const scene = this._attachedNode.getScene();
        const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        const uiImage = new Image("overlay", "assets/graphics/UI_overlay_01.png");
        gui.addControl(uiImage);

        const createArrow = (name: string, left: string, direction: number) => {
            const btn = new Image(name, "assets/graphics/arrow.png");
            btn.width = "50px"; btn.height = "50px";
            btn.left = left; btn.top = "40%";
            btn.onPointerDownObservable.add(() => {
                btn.alpha = 0.5; 
                this._cycleSplat(direction);
                setTimeout(() => btn.alpha = 1, 100);
            });
            gui.addControl(btn);
        };

        createArrow("prev", "-40%", -1);
        createArrow("next", "-30%", 1);

        this._loadSplat(this._urls[0]);
    }

    private async _cycleSplat(dir: number) {
        this._currentIndex = (this._currentIndex + dir + this._urls.length) % this._urls.length;
        if (this._currentSplat) this._currentSplat.dispose();
        await this._loadSplat(this._urls[this._currentIndex]);
    }

    private async _loadSplat(url: string) {
        const result = await ImportMeshAsync(url, this._attachedNode.getScene(), null, ".splat");
        this._currentSplat = result.meshes[0] as Mesh;
        this._currentSplat.parent = this._attachedNode;
        this._currentSplat.position = new Vector3(0, 0, 2);
    }
}