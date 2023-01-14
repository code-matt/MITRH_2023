import { SceneLoader } from "@babylonjs/core"

const loadScene = async ({ scene }) => {
    // let terrainContainer = await SceneLoader.LoadAssetContainerAsync(
    //     "/",
    //     "Terrain.glb",
    //     scene
    // )
    // terrainContainer.addAllToScene()
    SceneLoader.ImportMesh(
        "",
        "/", 
        "Terrain.gltf", 
        scene,
        function(meshes){

        }
    )
}

export default loadScene