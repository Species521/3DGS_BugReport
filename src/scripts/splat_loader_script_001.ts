import { TransformNode, ImportMeshAsync, Vector3, Mesh } from "@babylonjs/core";
import "@babylonjs/loaders/SPLAT/splatFileLoader";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Image } from "@babylonjs/gui/2D/controls/image";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";

export default class SplatLoaderScript {
    private _attachedNode: TransformNode;
    private _currentSplat: Mesh | null = null;
    private _currentIndex: number = 0;

    private _urls: string[] = [
        "https://raw.githubusercontent.com/Species521/3DGS_storage/main/clusterFly_M.ply",
        "https://raw.githubusercontent.com/Species521/3DGS_storage/main/Carabus_cancellatus_oligoscythus_bukowiniacus/Carabus_cancellatus_oligoscythus_bukowiniacus_med_noPin.ply",
        "https://raw.githubusercontent.com/Species521/3DGS_storage/main/Ixodes_holocyclus/Ixodes_holocyclus_Mid_noPin.ply"
    ];

    constructor(attachedNode: TransformNode) {
        this._attachedNode = attachedNode;
    }

    public async onStart(): Promise<void> {

        console.log("SplatLoaderScript has started!");

        const scene = this._attachedNode.getScene();
        const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        console.log("GUI created.");

        const rect = new Rectangle("test");
        rect.width = "300px";
        rect.height = "150px";
        rect.background = "red";
        rect.thickness = 0;

        gui.addControl(rect);

        console.log("Rectangle added.");

        const uiImage = new Image(
            "overlay",
            "assets/graphics/UI_overlay_01.png"
        );

        uiImage.stretch = Image.STRETCH_FILL;
        gui.addControl(uiImage);

        // 🔥 AUTO START LOAD (no more return)
        await this._loadSplat(this._urls[0]);
    }

    private async _cycleSplat(dir: number) {
        this._currentIndex =
            (this._currentIndex + dir + this._urls.length) % this._urls.length;

        if (this._currentSplat) {
            this._currentSplat.dispose();
        }

        await this._loadSplat(this._urls[this._currentIndex]);
    }

    private async _loadSplat(url: string) {

        console.log("Attempting load:", url);

        try {

            const scene = this._attachedNode.getScene();

            const result = await ImportMeshAsync(
                url,
                scene,
                null,
                ".ply" // IMPORTANT: matches your files
            );

            console.log("Import result:", result);

            if (!result.meshes || result.meshes.length === 0) {
                console.error("No meshes returned from loader!");
                return;
            }

            this._currentSplat = result.meshes[0] as Mesh;

            if (!this._currentSplat) {
                console.error("First mesh is null/undefined!");
                return;
            }

            this._currentSplat.parent = this._attachedNode;
            this._currentSplat.position = new Vector3(0, 0, 2);

            console.log("Splat successfully attached to scene.");

        } catch (err) {

            console.error("🔥 ImportMeshAsync FAILED:", err);

            console.error("URL used:", url);
        }
    }
}