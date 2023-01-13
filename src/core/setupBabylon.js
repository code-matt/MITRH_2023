import { ArcRotateCamera, Color3, DirectionalLight, Engine, FreeCamera, FreeCameraDeviceOrientationInput, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, UniversalCamera, Vector3, WebXRExperienceHelper } from "@babylonjs/core";
import { AdvancedDynamicTexture, ColorPicker, Control, StackPanel, TextBlock } from "@babylonjs/gui";

const createBabylon = async () => {
    let canvas = document.getElementById("mainCanvas")

    var engine = new Engine(canvas)

    var scene = new Scene(engine)

    var camera = new FreeCamera('camera', new Vector3(), scene)

    scene.createDefaultEnvironment()

    const mainRenderLoop = function() {
        console.log("rendering")
        scene.render()
    }

    engine.runRenderLoop(mainRenderLoop)

    console.log("Babylon finished init...")

    MeshBuilder.CreateBox('boxxx')

    camera.attachControl()

    const xrHelper = await WebXRExperienceHelper.CreateAsync(scene);

    return {
        canvas,
        engine,
        scene,
        camera
    }
}

export default createBabylon
