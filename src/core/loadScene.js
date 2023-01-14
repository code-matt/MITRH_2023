import { CubeTexture, MeshBuilder, SceneLoader, StandardMaterial, Texture } from "@babylonjs/core"

const loadScene = async ({ scene }) => {
    let terrainContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "Terrian.glb",
        scene
    )
    terrainContainer.addAllToScene()


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
}

export default loadScene