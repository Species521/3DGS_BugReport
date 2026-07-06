public async init(): Promise<void> {
        this._engine = new Engine(this._canvas, true, {
            stencil: true, 
            antialias: true, 
            adaptToDeviceRatio: true,
            preserveDrawingBuffer: false // Ensure this is false for performance
        });

        this._scene = new Scene(this._engine);
        // Force the scene to clear the depth buffer properly every frame
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
        // ... (keep your loadScene and camera code the same)

        const bgShield = MeshBuilder.CreateSphere("bgShield", { diameter: 500, segments: 16 }, scene);
        const shieldMat = new StandardMaterial("shieldMat", scene);
        shieldMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
        
        // FIX: Set backFaceCulling to true. Since it's a sphere, 
        // you only need to see the inside if the camera is inside it.
        // If you need to see the inside, use a DoubleSide material or invert the normals instead.
        shieldMat.backFaceCulling = true; 
        shieldMat.sideOrientation = 1; // 1 = MaterialHelper.MATERIAL_ClockWiseSideOrientation (inside out)
        
        shieldMat.disableLighting = true;
        bgShield.material = shieldMat;
    }