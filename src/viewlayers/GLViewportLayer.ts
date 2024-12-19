

import { Vector2 } from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { GameContext } from '../core/GameContext';
import { CycleInterface } from '../core/inferface/CycleInterface';
import { LoopInterface } from '../core/inferface/LoopInterface';

/**
 * WebGL çıktı ekranını yöneten katman
 */
export class GLViewportLayer implements CycleInterface, LoopInterface {

    fxaaPass: ShaderPass = new ShaderPass(FXAAShader); // FXAA (Fast Approximate Anti-Aliasing) pass'ı
    rendererSize: Vector2 = new Vector2(); // Render boyutunu tutan vektör

    init(): void {

        // Render ayarlarını yapılandır
        GameContext.GameView.Renderer.autoClear = false; // Otomatik temizlemeyi devre dışı bırak
        GameContext.GameView.Renderer.autoClearDepth = false; // Derinlik temizlemeyi devre dışı bırak
        GameContext.GameView.Renderer.autoClearStencil = false; // Stencil temizlemeyi devre dışı bırak

        // FXAA (Hızlı Yaklaşık Kenar Yumuşatma) şu anki sürümde bazı sorunlar yaşıyor, bu yüzden şu an devre dışı bırakıldı
        // this.fxaaPass = new ShaderPass(FXAAShader);
        // GameContext.GameView.EffectComposer.addPass(this.fxaaPass);
        // this.updateFXAAUniforms();
        // window.addEventListener('resize', () => { this.updateFXAAUniforms() }); // Pencere yeniden boyutlandırıldığında FXAA parametrelerini güncelle
    }

    // FXAA geçiş parametrelerini güncelle
    updateFXAAUniforms() {
        GameContext.GameView.Renderer.getSize(this.rendererSize); // Renderer boyutunu al
        (this.fxaaPass.material.uniforms['resolution'].value as Vector2).set(1 / this.rendererSize.x, 1 / this.rendererSize.y); // FXAA çözünürlüğünü güncelle
    }

    // Her frame'de yapılacak işlemler
    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        // Gökyüzü kutusunu render et
        GameContext.GameView.Renderer.render(GameContext.Scenes.Skybox, GameContext.Cameras.PlayerCamera);
        GameContext.GameView.Renderer.clearDepth(); // Derinlik bilgisini temizle

        // Oyun sahnesini render et
        GameContext.GameView.Renderer.render(GameContext.Scenes.Level, GameContext.Cameras.PlayerCamera);

        // Efekt sahnesini render et
        GameContext.GameView.Renderer.render(GameContext.Scenes.Sprites, GameContext.Cameras.PlayerCamera);
        GameContext.GameView.Renderer.clearDepth(); // Derinlik bilgisini temizle

        // El modeli sahnesini render et
        GameContext.GameView.Renderer.render(GameContext.Scenes.Handmodel, GameContext.Cameras.HandModelCamera);
        GameContext.GameView.Renderer.clearDepth(); // Derinlik bilgisini temizle

        // UI (Kullanıcı Arayüzü) sahnesini render et
        GameContext.GameView.Renderer.render(GameContext.Scenes.UI, GameContext.Cameras.UICamera);

        // Efekt kompozisyonunu render et (şu an kullanılmıyor)
        // GameContext.GameView.EffectComposer.render();
    }

}