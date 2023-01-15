import { CubeTexture, MeshBuilder, SceneLoader, StandardMaterial, Texture } from "@babylonjs/core"
import { AdvancedDynamicTexture } from '@babylonjs/gui'

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

    let flowerContainer = await SceneLoader.LoadAssetContainerAsync(
        "/",
        "AnimatedFlower.glb",
        scene
    )
    
    const flowerMesh = flowerContainer.meshes
    flowerMesh.forEach((mesh) => {
        const flowers = mesh.getChildMeshes()

        flowers.forEach((flower) => {
        })
    })
    flowerContainer.addToScene()

}

export default loadScene