import { AbstractMesh, NodeMaterial, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, ParticleSystemSet, Scene, SceneLoader, StandardMaterial, Texture, UniversalCamera, Vector3, WebXRInputSource } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { GridMaterial } from '@babylonjs/materials'
import { scoreboard } from "../components/scoreboard";
import _ from "lodash";

const createBabylon = async ({ connectAndBeginExperienceFxn }) => {
    let canvas = document.getElementById("mainCanvas")

    var engine = new Engine(canvas)

    var scene = new Scene(engine)

    scene.clearColor = Color3.Black()

    ParticleSystemSet.BaseAssetsUrl = "/"

    var camera = new UniversalCamera('camera', new Vector3(0, 3, 0), scene)
    camera.applyGravity = true
    camera.checkCollisions = true
    camera.speed = 0.5
    let coreStuff = {
        canvas,
        engine,
        scene,
        camera
    }

    camera.maxZ = 1000
    camera.minZ = 0.1

    var ground = MeshBuilder.CreatePlane("ground", {
        width: 100,
        height: 100
    }, scene)

    ground.rotation.x = -Math.PI / 2

    let groundMaterial = new GridMaterial("default", scene)

	groundMaterial.majorUnitFrequency = 5
	groundMaterial.minorUnitVisibility = 0.45
	groundMaterial.gridRatio = 2
	groundMaterial.backFaceCulling = false
	groundMaterial.mainColor = new Color3(1, 1, 1)
	groundMaterial.lineColor = new Color3(1.0, 1.0, 1.0)
	groundMaterial.opacity = 0.98

    ground.material = groundMaterial

    const light = new HemisphericLight("light", new Vector3(1, 1, 0))

    // scene.createDefaultEnvironment()

    console.log("Babylon finished init...")

    const box = new MeshBuilder.CreateTorus('torus', {diameter: 20, thickness: 5, tessellation: 24}, scene);
    box.position.y = 20;
    box.position.x = -50;
    box.position.z = 0;
    box.rotation.z = Math.PI/2;
    NodeMaterial.ParseFromFileAsync("", "materials/nodeMaterial_blue_diamonds.json", scene).then(nodeMaterial => {
        box.material = nodeMaterial;
   });

   const box2 = new MeshBuilder.CreateTorus('torus', {diameter: 30, thickness: 2, tessellation: 24}, scene);
   box2.position.y = 20;
   box2.position.x = -50;
   box2.position.z = 0;
   box2.rotation.z = Math.PI/4;
   NodeMaterial.ParseFromFileAsync("", "materials/PinkTransparentDiamond_Materials.json", scene).then(nodeMaterial => {
       box2.material = nodeMaterial;
  });

  const box3 = new MeshBuilder.CreateTorus('torus', {diameter: 30, thickness: 2, tessellation: 24}, scene);
  box3.position.y = 20;
  box3.position.x = -50;
  box3.position.z = 0;
  box3.rotation.z = Math.PI;
  NodeMaterial.ParseFromFileAsync("", "materials/PinkTransparentDiamond_Materials.json", scene).then(nodeMaterial => {
    box3.material = nodeMaterial;
 });

 
 const box4 = new MeshBuilder.CreateTorus('torus', {diameter: 30, thickness: 2, tessellation: 24}, scene);
 box4.position.y = 20;
 box4.position.x = -50;
 box4.position.z = 0;
 box4.rotation.z = -Math.PI/4;
 NodeMaterial.ParseFromFileAsync("", "materials/PinkTransparentDiamond_Materials.json", scene).then(nodeMaterial => {
    box4.material = nodeMaterial;
});

const sphere = new MeshBuilder.CreatePolyhedron('polyhedron', scene);
sphere.position.y = 20;
sphere.position.x = -50;
sphere.position.z = 0;
sphere.rotation.z = Math.PI/2;
NodeMaterial.ParseFromFileAsync("", "materials/nodeMaterial_blue_diamonds.json", scene).then(nodeMaterial => {
    sphere.material = nodeMaterial;
});


    const panel = MeshBuilder.CreatePlane('panel', {width: 1.77, height: 1})

    panel.position.x = 0

    panel.position.y = 1

    panel.position.z = 1.5

    const panelTexture = AdvancedDynamicTexture.CreateForMesh(panel, 1920, 1080)

    let screenNumber = 1
    panelTexture.parseFromURLAsync('textures/screen_1.json')

    const skipButtonBox = MeshBuilder.CreatePlane('button', {width: 0.5, height: 0.1})
    const skipButtonBoxTexture = AdvancedDynamicTexture.CreateForMesh(skipButtonBox, 176, 59)

    const skipButton = Button.CreateSimpleButton('btn', '')

    skipButtonBoxTexture.addControl(skipButton)

    skipButtonBox.position.x = 0.55

    skipButtonBox.position.y = 1.35

    skipButtonBox.position.z = 1.5

    const nextButtonBox = MeshBuilder.CreatePlane('button', {width: 0.5, height: 0.1})
    const buttonBoxTexture = AdvancedDynamicTexture.CreateForMesh(nextButtonBox, 176, 59)

    const nextButton = Button.CreateSimpleButton('btn', '')

    buttonBoxTexture.addControl(nextButton)

    nextButtonBox.position.x = 0.55

    nextButtonBox.position.y = 0.65

    nextButtonBox.position.z = 1.5

    skipButton.onPointerDownObservable.addOnce(() => {
        panel.dispose()
        nextButton.dispose()
        nextButtonBox.dispose()
        skipButtonBox.dispose()
        connectAndBeginExperienceFxn(coreStuff)
    })

    nextButton.onPointerDownObservable.add(() => {
        if (screenNumber == 3) {
            panel.dispose()
            nextButton.dispose()
            nextButtonBox.dispose()
            skipButtonBox.dispose()
            connectAndBeginExperienceFxn(coreStuff)
        }
        screenNumber+=1
        panelTexture.parseFromURLAsync(`textures/screen_${screenNumber}.json`)
    })

    camera.attachControl()

    let groundContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "WalkingArea.glb",
        scene
    )
    groundContainer.addAllToScene()

    groundContainer.meshes[1].checkCollisions = true

    let invisGroundContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "invisiblewalking_area.glb",
        scene
    )
    invisGroundContainer.addAllToScene()

    invisGroundContainer.meshes[1].checkCollisions = true
    invisGroundContainer.meshes[1].isVisible = false

    let defaultExpHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [
            groundContainer.meshes[1],
            invisGroundContainer.meshes[1]
        ]
    })

    const handleHandUpdate = function (data) {
        data.mesh.computeWorldMatrix(true);
        coreStuff.room.send("hand_update", {
            hand: data.hand,
            data: {
                pX: data.mesh.absolutePosition.x,
                pY: data.mesh.absolutePosition.y,
                pZ: data.mesh.absolutePosition.z
            }
        })
    }
  
    let updateHandPositionThrottled = _.throttle(handleHandUpdate, 50)

    defaultExpHelper.input.onControllerAddedObservable.add((controller) => {
        const isHand = controller.inputSource.hand;
        if (isHand) {
            return
            //TODO: Def make this work !
        }

        controller.onMotionControllerInitObservable.add((motionController) =>{
            const isLeft = motionController.handedness === 'left';
            controller.onMeshLoadedObservable.add((mesh) => {
                mesh.onAfterWorldMatrixUpdateObservable.add((e) => {
                    // room below bets added only after instructions done
                    if (coreStuff.room) {
                        updateHandPositionThrottled({
                            hand: motionController.handedness,
                            mesh
                        })
                    }
                })
            });
        });
    });

    coreStuff.defaultExpHelper = defaultExpHelper

    var environment_map = CubeTexture.CreateFromPrefilteredData(
        'environment_3.env',
        scene
    );



    // TODO: try this and rotate scar under the world ? lol.. or fix env map
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

    coreStuff.ground = groundContainer.meshes[0] // TODO: Maybe 1
    return coreStuff
}

export default createBabylon
