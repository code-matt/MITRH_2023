import { MeshBuilder } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui'
const scoreboard = () => {
    const board = MeshBuilder.CreatePlane('board', {width: 1.77, height: 1});

    board.position.x = 2;

    board.position.y = 1;

    board.position.z = 1.5;

    const boardTexture = AdvancedDynamicTexture.CreateForMesh(board, 1920, 1080);

    boardTexture.parseFromURLAsync('textures/scoreboard.json');

    const panel = MeshBuilder.CreatePlane('panel', {width: 1.77, height: 1});

    panel.position.x = board.position.x - 0.4;

    panel.position.y = board.position.y + 0.2

    panel.position.z = board.position.z;

    const panelTexture = AdvancedDynamicTexture.CreateForMesh(panel, 1920, 1080);
    
    const text = new TextBlock();
    panelTexture.addControl(text);  
    text.resizeToFit = true;
    text.color = "black";
    text.heightInPixels = 200;
    text.text = 'Score Board' 

}


export { scoreboard }