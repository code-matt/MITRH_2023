import { ArcRotateCamera, Color3, CubeTexture, DirectionalLight, Engine, FreeCamera, FreeCameraDeviceOrientationInput, HemisphericLight, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, Texture, UniversalCamera, Vector3, WebXRExperienceHelper } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, ColorPicker, Control, StackPanel, TextBlock } from "@babylonjs/gui";
import { GridMaterial } from '@babylonjs/materials'
import loadScene from "./loadScene";
import { setupTimeoutWidget } from "../components/timeoutWidget";

const createBabylon = async ({ connectAndBeginExperienceFxn }) => {
    let canvas = document.getElementById("mainCanvas")

    var engine = new Engine(canvas)

    var scene = new Scene(engine)

    scene.clearColor = Color3.Black();

    var camera = new UniversalCamera('camera', new Vector3(0, 1.6, 0), scene)
    
    let invisPlane = MeshBuilder.CreatePlane("plane",  {width: 1, height: 1}, scene);
    let invisTexture = AdvancedDynamicTexture.CreateForMesh(invisPlane, {width: 1000, height: 250});
    invisTexture.parseFromURLAsync('textures/invisPlane.json');
    
    let timeoutFunction = setupTimeoutWidget(invisPlane);
    timeoutFunction('Welcome to SoulSync!', 10000);

    invisPlane.position.y = 1.6;
    invisPlane.position.z = 1;

    let coreStuff = {
        canvas,
        engine,
        scene,
        camera,
        timeoutFunction
    }

    camera.maxZ = 1000
    camera.minZ = 0.1

    var ground = MeshBuilder.CreatePlane("ground", {
        width: 100,
        height: 100
    }, scene)

    ground.rotation.x = -Math.PI / 2

    let groundMaterial = new GridMaterial("default", scene);

	groundMaterial.majorUnitFrequency = 5;
	groundMaterial.minorUnitVisibility = 0.45;
	groundMaterial.gridRatio = 2;
	groundMaterial.backFaceCulling = false;
	groundMaterial.mainColor = new Color3(1, 1, 1);
	groundMaterial.lineColor = new Color3(1.0, 1.0, 1.0);
	groundMaterial.opacity = 0.98;

    ground.material = groundMaterial

    const light = new HemisphericLight("light", new Vector3(1, 1, 0));

    // scene.createDefaultEnvironment()

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

    skipButtonBox.position.z = 1.5;

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
        connectAndBeginExperienceFxn(coreStuff)
    })

    nextButton.onPointerDownObservable.add(() => {
        if (screenNumber == 3) {
            panel.dispose();
            nextButton.dispose();
            nextButtonBox.dispose();
            skipButtonBox.dispose();
            connectAndBeginExperienceFxn(coreStuff)
        }
        screenNumber+=1;
        panelTexture.parseFromURLAsync(`textures/screen_${screenNumber}.json`);
    })

    camera.attachControl()

    WebXRExperienceHelper.CreateAsync(scene).then(async (xrHelper) => {
        const sessionManager = await xrHelper.enterXRAsync("immersive-vr", "local-floor" /*, optionalRenderTarget */ );
    }, (error) => {
        // no xr...
    })


    var environment_map = CubeTexture.CreateFromPrefilteredData(
        'environment_3.env',
        scene
    );
    // var map_rotation = Math.PI; // in degrees
    scene.environmentTexture = environment_map;

    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;

    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = environment_map
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    // loadScene({ scene })

    return coreStuff
}

export default createBabylon
