import { CubeTexture, MeshBuilder, SceneLoader, StandardMaterial, Texture } from "@babylonjs/core"

const loadScene = async ({ scene }) => {
    let terrainContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "Terrain.glb",
        scene
    )
    terrainContainer.addAllToScene()

    let grassContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "Temple.glb",
        scene
    )
    grassContainer.addAllToScene()

    let templeContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "Grass.glb",
        scene
    )
    templeContainer.addAllToScene()

    let treeContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "Tree.glb",
        scene
    )
    treeContainer.addAllToScene()
}

export default loadScene