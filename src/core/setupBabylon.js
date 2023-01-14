import { ArcRotateCamera, Color3, DirectionalLight, Engine, FreeCamera, FreeCameraDeviceOrientationInput, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, UniversalCamera, Vector3, WebXRExperienceHelper } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, ColorPicker, Control, StackPanel, TextBlock } from "@babylonjs/gui";

const createBabylon = async () => {
    let canvas = document.getElementById("mainCanvas")

    var engine = new Engine(canvas)

    var scene = new Scene(engine)

    var camera = new FreeCamera('camera', new Vector3(), scene)

    scene.createDefaultEnvironment()

    const mainRenderLoop = function() {
        scene.render()
    }

    engine.runRenderLoop(mainRenderLoop)

    console.log("Babylon finished init...")

    const panel = MeshBuilder.CreatePlane('panel', {width: 1.77, height: 1});

    panel.position.x = 0;

    panel.position.y = 1;

    panel.position.z = 1.5;

    const panelTexture = AdvancedDynamicTexture.CreateForMesh(panel, 1920, 1080);

    let screenNumber = 1;
    panelTexture.parseFromURLAsync('textures/screen_1.json');

    const skipButtonBox = MeshBuilder.CreatePlane('button', {width: 0.5, height: 0.1});
    const skipButtonBoxTexture = AdvancedDynamicTexture.CreateForMesh(skipButtonBox, 176, 59);

    const skipButton = Button.CreateSimpleButton('btn', '');

    skipButtonBoxTexture.addControl(skipButton);

    skipButtonBox.position.x = 0.55;

    skipButtonBox.position.y = 1.35;

    skipButtonBox.position.z = 1.25;

    const nextButtonBox = MeshBuilder.CreatePlane('button', {width: 0.5, height: 0.1});
    const buttonBoxTexture = AdvancedDynamicTexture.CreateForMesh(nextButtonBox, 176, 59);

    const nextButton = Button.CreateSimpleButton('btn', '');

    buttonBoxTexture.addControl(nextButton);

    nextButtonBox.position.x = 0.55;

    nextButtonBox.position.y = 0.65;

    nextButtonBox.position.z = 1.5;

    skipButton.onPointerDownObservable.addOnce(() => {
        panel.dispose();
        nextButton.dispose();
        nextButtonBox.dispose();
        skipButtonBox.dispose();
    })

    nextButton.onPointerDownObservable.add(() => {
        if (screenNumber == 3) {
            panel.dispose();
            nextButton.dispose();
            nextButtonBox.dispose();
            skipButtonBox.dispose();
        }
        screenNumber+=1;
        panelTexture.parseFromURLAsync(`textures/screen_${screenNumber}.json`);
    })

    camera.attachControl()

    // const xrHelper = await WebXRExperienceHelper.CreateAsync(scene);

    // const ground = MeshBuilder.CreateGround("ground", {height: 100, width: 100, subdivisions: 4});
    // ground.visibility = 0

    // var xrHelper = await scene.createDefaultXRExperienceAsync({
    // //   floorMeshes: [ground],
    //     disableDefaultUI: false
        
    // });

    // xrHelper.enterExitUI = true

    // xrHelper.enterExitUI()

    WebXRExperienceHelper.CreateAsync(scene).then(async (xrHelper) => {
        const sessionManager = await xrHelper.enterXRAsync("immersive-vr", "local-floor" /*, optionalRenderTarget */ );
    }, (error) => {
        // no xr...
    })

    return {
        canvas,
        engine,
        scene,
        camera
    }
}

export default createBabylon
