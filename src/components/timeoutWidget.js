import { MeshBuilder } from "@babylonjs/core";
import { TextBlock, AdvancedDynamicTexture } from "@babylonjs/gui";

const setupTimeoutWidget = (UIElement) => {
    return (content, timeout) => {
        const text = new TextBlock();
        setTimeout(() => {text.dispose()}, timeout);
          
        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(UIElement);
        advancedTexture.addControl(text);  
        text.resizeToFit = true;
        text.color = "white";
        text.heightInPixels = 200;
        text.text = content;
    }
}

export { setupTimeoutWidget }