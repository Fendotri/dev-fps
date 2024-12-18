
import { Capsule } from "three/examples/jsm/math/Capsule";
import { Octree } from "three/examples/jsm/math/Octree";
import { GameContext } from '@src/core/GameContext';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { UserInputEventEnum } from '@src/gameplay/abstract/EventsEnum';
import { UserInputEvent, UserInputEventPipe } from '@src/gameplay/pipes/UserinputEventPipe';
import { Vector3 } from 'three';

const STEPS_PER_FRAME = 5; // Her karede yapılacak işlem sayısı (fiziksel hesaplamaların doğruluğunu artırmak için)
const GRAVITY = 30; // Yerçekimi kuvveti
const vec3Util = new Vector3(); // Vektör hesaplamaları için yardımcı vektör

const config = {
    groundControlFactor: 20., // Yerdeyken oyuncunun hareketini kontrol etme faktörü
    airControlFactor: 5., // Havadayken oyuncunun hareketini kontrol etme faktörü
    dampFactor: -10., // Havanın oyuncu hızını azaltma oranı
    movespeedFactor: 2.4 // Hareket hızını etkileyen faktör
}

/**
 * Hareket Kontrolörü - Kullanıcı girişine göre oyuncunun hareketini kontrol eder.
 */
export class MovementController implements CycleInterface, LoopInterface {

    playerOctree: Octree = GameContext.Physical.WorldOCTree; // Oyuncu için dünya üzerindeki çarpışmaları kontrol etmek için kullanılan Octree
    playerCamera: THREE.Camera; // Oyuncunun kamerası
    playerCollider: Capsule; // Oyuncu için kapsül şeklinde bir çarpışma modelini temsil eder

    playerOnFloor: boolean = true; // Oyuncunun zeminde olup olmadığını kontrol eden değişken
    keyStates: Map<UserInputEventEnum, boolean> = new Map(); // Kullanıcı girişlerini izlemek için kullanılan anahtar durumları haritası

    playerVelocity: THREE.Vector3 = new Vector3(); // Oyuncunun hız vektörü
    playerDirection: THREE.Vector3 = new Vector3(); // Oyuncunun hareket yönü

    init(): void {
        // Başlatma işlemleri
        this.playerOctree = GameContext.Physical.WorldOCTree; // Fiziksel dünya üzerinde çarpışmaları kontrol etmek için octree'yi alır
        this.playerCamera = GameContext.Cameras.PlayerCamera; // Oyuncu kamerasını alır
        this.playerCollider = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1.45, 0), 0.35); // Oyuncu için kapsül çarpışma modeli oluşturulur

        // Kullanıcı girişlerini dinleyen event listener ekler
        UserInputEventPipe.addEventListener(UserInputEvent.type, (e: CustomEvent) => {
            switch (e.detail.enum) {
                case UserInputEventEnum.MOVE_FORWARD_DOWN:
                    this.keyStates.set(UserInputEventEnum.MOVE_FORWARD_DOWN, true); // İleri hareket başlatıldığında
                    break;
                case UserInputEventEnum.MOVE_BACKWARD_DOWN:
                    this.keyStates.set(UserInputEventEnum.MOVE_BACKWARD_DOWN, true); // Geri hareket başlatıldığında
                    break;
                case UserInputEventEnum.MOVE_LEFT_DOWN:
                    this.keyStates.set(UserInputEventEnum.MOVE_LEFT_DOWN, true); // Sol hareket başlatıldığında
                    break;
                case UserInputEventEnum.MOVE_RIGHT_DOWN:
                    this.keyStates.set(UserInputEventEnum.MOVE_RIGHT_DOWN, true); // Sağ hareket başlatıldığında
                    break;
                case UserInputEventEnum.MOVE_FORWARD_UP:
                    this.keyStates.set(UserInputEventEnum.MOVE_FORWARD_DOWN, false); // İleri hareket bırakıldığında
                    break;
                case UserInputEventEnum.MOVE_BACKWARD_UP:
                    this.keyStates.set(UserInputEventEnum.MOVE_BACKWARD_DOWN, false); // Geri hareket bırakıldığında
                    break;
                case UserInputEventEnum.MOVE_LEFT_UP:
                    this.keyStates.set(UserInputEventEnum.MOVE_LEFT_DOWN, false); // Sol hareket bırakıldığında
                    break;
                case UserInputEventEnum.MOVE_RIGHT_UP:
                    this.keyStates.set(UserInputEventEnum.MOVE_RIGHT_DOWN, false); // Sağ hareket bırakıldığında
                    break;
                case UserInputEventEnum.JUMP: // Zıplama işlemi başlatıldığında
                    this.jump();
                    break;
            }

        })

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        const dt = Math.min(0.05, deltaTime) / STEPS_PER_FRAME; // DeltaTime'ı sınırla ve her karedeki adım sayısına böl
        for (let i = 0; i < STEPS_PER_FRAME; i++) { // Fiziksel hesaplamaların doğruluğu için birden fazla adımda işlem yap
            this.controls(dt); // Kullanıcı girişine göre hareket yönünü belirle
            this.updatePlayer(dt); // Oyuncunun fiziksel konumunu güncelle
            this.teleportPlayerIfOob(); // Oyuncu harita dışına çıkarsa konumunu sıfırla
        }
    }

    /**
     * Oyuncunun vücut yönünü kontrol etme
     * @param deltaTime: Bir kare arasındaki zaman farkı
     */
    controls(deltaTime: number): void {
        // Havadayken ve yerdeyken vücut hareketi kontrol faktörü hesaplanır
        const airControlFactor = deltaTime * (this.playerOnFloor ? config.groundControlFactor : config.airControlFactor);
        this.playerDirection.set(0, 0, 0); // Hareket yönünü sıfırla
        if (this.playerOnFloor) {
            if (this.keyStates.get(UserInputEventEnum.MOVE_FORWARD_DOWN)) // İleri hareket
                this.playerDirection.add(this.getForwardVector().normalize());
            if (this.keyStates.get(UserInputEventEnum.MOVE_BACKWARD_DOWN)) // Geri hareket
                this.playerDirection.add(this.getForwardVector().normalize().multiplyScalar(-1));
            if (this.keyStates.get(UserInputEventEnum.MOVE_LEFT_DOWN)) // Sol hareket
                this.playerDirection.add(this.getSideVector().normalize().multiplyScalar(-1));
            if (this.keyStates.get(UserInputEventEnum.MOVE_RIGHT_DOWN)) // Sağ hareket
                this.playerDirection.add(this.getSideVector().normalize());
            if (this.playerDirection.lengthSq() > 1.) // Yön vektörünün uzunluğunu normalize et
                this.playerDirection.normalize(); 
        }
        this.playerVelocity.add(this.playerDirection.multiplyScalar(airControlFactor * config.movespeedFactor)); // Hızı yön ile çarp
    }

    /**
     * Oyuncunun konumunu günceller ve çarpışmalarla kontrol eder
     * @param deltaTime: Bir kare arasındaki zaman farkı
     */
    updatePlayer(deltaTime: number) {

        let damping = Math.exp(config.dampFactor * deltaTime) - 1; // Hava direnci hesaplaması

        if (!this.playerOnFloor) { // Yerde değilse, yerçekimi etkisini uygula
            this.playerVelocity.y -= GRAVITY * deltaTime;
            damping *= 0.1; // Havada küçük bir hava direnci
        }

        this.playerVelocity.addScaledVector(this.playerVelocity, damping); // Hızın yavaşlamasını uygula
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime); // Hareket miktarını hesapla
        this.playerCollider.translate(deltaPosition); // Çarpışma modeline hareket uygula
        const result = this.playerOctree.capsuleIntersect(this.playerCollider); // Çarpışma tespiti yap
        this.playerOnFloor = false;
        if (result) {
            this.playerOnFloor = result.normal.y > 0; // Yerde olup olmadığını kontrol et
            if (!this.playerOnFloor) this.playerVelocity.addScaledVector(result.normal, - result.normal.dot(this.playerVelocity)); // Zemin ile çarpışmayı hesapla
            this.playerCollider.translate(result.normal.multiplyScalar(result.depth)); // Çarpışma derinliği kadar oyuncuyu taşı
        }
        this.playerCamera.position.copy(this.playerCollider.end); // Kameranın pozisyonunu güncelle

    }

    /**
     * Oyuncu harita dışına çıktıysa konumunu sıfırlama
     */
    teleportPlayerIfOob() {
        if (this.playerCamera.position.y <= -25) { // Eğer oyuncu harita dışına çıktıysa
            this.playerCollider.start.set(0, 0.35, 0);
            this.playerCollider.end.set(0, 1, 0);
            this.playerCollider.radius = 0.35; // Kapsülün boyutunu sıfırla
            this.playerCamera.position.copy(this.playerCollider.end); // Kameranın pozisyonunu sıfırla
            this.playerCamera.rotation.set(0, 0, 0); // Kameranın rotasını sıfırla
        }
    }

    /**
     * Kamera yönünü al (ileri yön)
     * @returns THREE.Vector3: İleri yön vektörü
     */
    getForwardVector() {
        this.playerCamera.getWorldDirection(vec3Util); // Kameranın dünya yönünü al
        vec3Util.y = 0; // Y eksenindeki hareketi sıfırla
        vec3Util.normalize(); // Yönü normalize et
        return vec3Util;
    }

    /**
     * Kamera yönünü al (yan yön)
     * @returns THREE.Vector3: Yan yön vektörü
     */
    getSideVector() {
        this.playerCamera.getWorldDirection(vec3Util);
        vec3Util.y = 0;
        vec3Util.normalize();
        vec3Util.cross(this.playerCamera.up);
        return vec3Util;
    }

    /**
     * zıplama
     */
    jump() {
        if (this.playerOnFloor) { this.playerVelocity.y = 8; }
    }

}