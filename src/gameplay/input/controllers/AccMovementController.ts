import { GameContext } from "@src/core/GameContext"
import { Capsule } from "three/examples/jsm/math/Capsule"
import { Octree } from "three/examples/jsm/math/Octree";
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { Vector3 } from 'three'

const config = {
    capsuleRadius: .3, // Capsule'ın başlangıç ve bitiş noktası arasındaki yarıçap
    capsuleHeight: 1.8, // Capsule'ın toplam yüksekliği
    stepsPerFrame: 10, // Her karede yapılan çarpışma kontrolü sayısı, model geçişlerini engellemek için
    groundControlMass: 1.0, // Yerdeyken hareket kontrolü için ağırlık
    airControlMass: .3, // Hava hareket kontrolü için ağırlık
    resistancea: 36, // Yerdeki sürtünme hızını azaltma
    movespeeda: 72, // Hareket hızlanması
    jumpspeed: 2.5 * 3, // Zıplama hızı
    movespeedmax: 4.0, // Maksimum hareket hızı
    gravity: 9.8 * 3, // Yerçekimi hızlandırması
}

const keyStates = {}; // Tuş durumu

document.addEventListener('keydown', (event) => { keyStates[event.code] = true; });
document.addEventListener('keyup', (event) => { keyStates[event.code] = false; });

// Bazı yardımcı değişkenlerin başlatılması

const v3Util: THREE.Vector3 = new Vector3();
const vhorizon = new Vector3();

let maxspeedSqrt: number = Math.pow(config.movespeedmax, 2); // Başlangıçta hesaplanır, gereksiz hesaplamayı önler
let vVertical = 0;
let onFloor: boolean = true;

/**
 * Oyuncu kontrol sınıfı, hızlanma hesaplamalarını yapar
 */
class AccMovementController implements LoopInterface, CycleInterface {

    worldOctree: Octree = GameContext.Physical.WorldOCTree;
    camera: THREE.Camera; // Kontrolcünün oyuncu kamerası
    startPoint: THREE.Vector3 = new Vector3(0, config.capsuleRadius, 0);
    endPoint: THREE.Vector3 = new Vector3(0, config.capsuleHeight - config.capsuleRadius, 0);
    playerCollider: Capsule = new Capsule(this.startPoint, this.endPoint, config.capsuleRadius); // Oyuncunun çarpışma hacmi bir kapsül (0 ~ 1.8)
    velocity: THREE.Vector3 = new Vector3(); // Geçerli hız
    moveDirection: THREE.Vector3 = new Vector3(); // Hareket yönü (klavye tuşları)

    init(): void {
        this.camera = GameContext.Cameras.PlayerCamera;
        this.startPoint.set(0, config.capsuleRadius, 0);
        this.endPoint.set(0, config.capsuleHeight - config.capsuleRadius, 0);
        this.playerCollider.set(this.startPoint, this.endPoint, config.capsuleRadius);
        maxspeedSqrt = Math.pow(config.movespeedmax, 2); // Maksimum hızın karesi
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        deltaTime = Math.min(0.05, deltaTime / config.stepsPerFrame); // Delta zamanının her kareye bölünmesi
        const camera = this.camera;
        const collider = this.playerCollider;
        const keyboardD = this.moveDirection;
        const v = this.velocity;

        // Her karede yapılan hareketleri birden fazla çarpışma kontrolüne böler
        for (let i = 0; i < config.stepsPerFrame; i++) {
            vhorizon.copy(v);
            vhorizon.y = 0;
            vVertical = v.y;
            const bodyControl = (onFloor ? config.groundControlMass : config.airControlMass); // Yerdeyse hareketin kontrol oranı

            // 1. Klavye girdilerine dayalı olarak hareket yönü
            keyboardD.set(0, 0, 0);
            if (keyStates['KeyW']) keyboardD.add(this.getCameraForwardVector());
            if (keyStates['KeyS']) keyboardD.addScaledVector(this.getCameraForwardVector(), -1);
            if (keyStates['KeyA']) keyboardD.addScaledVector(this.getCameraSideVector(), -1);
            if (keyStates['KeyD']) keyboardD.add(this.getCameraSideVector());
            keyboardD.normalize(); // Klavye yönü normalleştirildi

            // 2. v1 = v0 + deltaV; deltaV = a * deltaTime
            vhorizon.addScaledVector(keyboardD, config.movespeeda * bodyControl * deltaTime);

            // 3. Sürtünme ile hız kaybı
            const lengthSqrt = vhorizon.lengthSq(); // Mevcut hızın karesi
            if (lengthSqrt != 0) { // Eğer hız sıfır değilse, sürtünme etkisi
                const deltaRT = config.resistancea * deltaTime // Hız kaybı (vektör)
                if (onFloor) { // Yerdeyken sürtünme etkisi
                    if (lengthSqrt - Math.pow(deltaRT, 2) > 0) vhorizon.setLength(Math.pow(lengthSqrt, 1 / 2) - deltaRT);
                    else vhorizon.set(0, 0, 0); // Hız sıfırlanır
                }
            }

            // 4. Dikey hız, zıplama
            if (onFloor) if (keyStates['Space']) vVertical = config.jumpspeed; // Zemin üzerindeyse ve boşluk tuşuna basıldıysa zıplama
            if (!onFloor) vVertical -= config.gravity * deltaTime; // Eğer yerden havadaysa, yerçekimi etkisi

            // 5. Maksimum hız sınırı
            if (lengthSqrt > maxspeedSqrt) vhorizon.setLength(config.movespeedmax); // Hız maksimum değeri aşarsa, sınırla

            // 6. Çarpışma kontrolü
            v.set(vhorizon.x, vVertical, vhorizon.z); // Yatay ve dikey hız birleştirilir
            const deltaPosition = v3Util.copy(v).multiplyScalar(deltaTime); // deltaPosition = v * t
            collider.translate(deltaPosition); // Çarpışma kontrolü için pozisyon güncellenir
            const result = this.worldOctree.capsuleIntersect(collider); // Çarpışma sonucu
            onFloor = false;

            // 7. Çarpışma sonucu işleme
            if (result) {
                onFloor = result.normal.y > 0; // Çarpışma normalinin yukarı doğru olup olmadığını kontrol et
                if (!onFloor) v.addScaledVector(result.normal, - result.normal.dot(v)); // Duvar veya tavanda: Hız eklenir
                collider.translate(result.normal.multiplyScalar(result.depth)); // Kapsül, çarpışma yüzeyinden dışarı çekilir
                if (onFloor) v.y = 0; // Yerdeyken dikey hız sıfırlanır
            }

            // 7. Kamera son pozisyonu kapsülün bitiş noktasına yapıştırılır
            camera.position.copy(collider.end);

        }

    }

    /** Kameranın yatay yönünü alır */
    getCameraForwardVector() {
        const camera = this.camera;
        camera.getWorldDirection(v3Util);
        v3Util.y = 0;
        v3Util.normalize();
        return v3Util;
    }

    /** Kameranın yatay yönünü (sol/sağ, çapraz çarpan) alır */
    getCameraSideVector() {
        const camera = this.camera;
        camera.getWorldDirection(v3Util);
        v3Util.y = 0;
        v3Util.normalize();
        v3Util.cross(camera.up);
        return v3Util;
    }

}

export { AccMovementController }