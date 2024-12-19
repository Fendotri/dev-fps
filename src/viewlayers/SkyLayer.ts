import { Sky } from 'three/examples/jsm/objects/Sky'
import { GameContext } from "@src/core/GameContext"
import { CycleInterface } from '../core/inferface/CycleInterface';
import { MathUtils, Vector3 } from 'three';

// Gökyüzü efektinin yapılandırma ayarları
const skyEffectConfig = {
    turbidity: 4, // Bulanıklık
    rayleigh: 1, // Rayleigh dağılma
    mieCoefficient: 0.003, // Mie dağılım katsayısı
    mieDirectionalG: 0.7, // Mie yönlü dağılım faktörü
    elevation: 20, // Yükselti
    azimuth: -10, // Azimut açısı
    exposure: GameContext.GameView.Renderer.toneMappingExposure, // Pozlama değeri
}

/**
 * Three.js SkyShader kullanarak bir materyal oluşturur ve bu materyali gökyüzü kutusu olarak kullanır
 */
export class SkyLayer implements CycleInterface {

    scene: THREE.Scene; // Sahne
    sky: Sky = new Sky(); // Gökyüzü objesi
    sun: THREE.Vector3 = new Vector3(); // Güneşin pozisyonu

    /** Şu anki durumda her frame'de bilgi güncellemeye gerek yok */
    init(): void {
        this.scene = GameContext.Scenes.Skybox; // Gökyüzü sahnesini al
        this.sky.scale.setScalar(1000);  // THREE.Sky, shader kullanarak materyal oluşturur ve bu materyali bir kutu üzerine ekler; burada kutunun boyutunu ayarlıyoruz

        const uniforms = this.sky.material.uniforms; // Gökyüzü materyali için uniform ayarlarını al
        uniforms['turbidity'].value = skyEffectConfig.turbidity; // Bulanıklık
        uniforms['rayleigh'].value = skyEffectConfig.rayleigh; // Rayleigh dağılma
        uniforms['mieCoefficient'].value = skyEffectConfig.mieCoefficient; // Mie katsayısı
        uniforms['mieDirectionalG'].value = skyEffectConfig.mieDirectionalG; // Mie yönlü dağılım

        // Güneşin konumunu hesapla
        const phi = MathUtils.degToRad(90 - skyEffectConfig.elevation); // Yükseltiyi radiana çevir
        const theta = MathUtils.degToRad(skyEffectConfig.azimuth); // Azimut açısını radiana çevir
        this.sun.setFromSphericalCoords(1, phi, theta); // Spherical koordinatlarını kullanarak güneşi konumlandır

        uniforms['sunPosition'].value.copy(this.sun); // Güneşin pozisyonunu uniform'a kopyala
        GameContext.GameView.Renderer.toneMappingExposure = skyEffectConfig.exposure; // Pozlama ayarını yap
        this.scene.add(this.sky); // Gökyüzü objesini sahneye ekle
    }

}