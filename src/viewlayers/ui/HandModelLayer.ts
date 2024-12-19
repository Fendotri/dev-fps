import { GameContext } from '@src/core/GameContext';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { PointLockEventEnum } from '@src/gameplay/abstract/EventsEnum';
import { DomEventPipe, PointLockEvent } from '@src/gameplay/pipes/DomEventPipe';
import { LocalPlayer } from '@src/gameplay/player/LocalPlayer';
import { MathUtils, Vector3 } from 'three';

let deltaZUtil = 0;
let deltaYUtil = 0;

let screenMoveX = 0; // Fare hareketi ile ekranın X eksenindeki kayma miktarı
let screenMoveY = 0; // Fare hareketi ile ekranın Y eksenindeki kayma miktarı
let mouseFloatX = 0.08; // Fare ile yatay hareketle kamera Z eksenindeki değişim
let mouseFloatY = 0.12; // Fare ile dikey hareketle kamera Y eksenindeki değişim

let breathFloatScale = 0.01; // Solunumdan kaynaklanan kamera Y eksenindeki değişim
let cameraDefaultPosition = new Vector3();

// breath   -1, 1   - breathFloatScale, breathFloatScale
// screenMoveX   -256, 256   -mouseFloatX, mouseFloatX
// screenMoveY   -256, 256   -mouseFloatY, mouseFloatY

/**
 * El modeli animasyonu
 */
export class HandModelLayer implements CycleInterface, LoopInterface {

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    localPlayer: LocalPlayer = LocalPlayer.getInstance();
    animationMixer: THREE.AnimationMixer;

    init(): void {
        this.scene = GameContext.Scenes.Handmodel;
        DomEventPipe.addEventListener(PointLockEvent.type, function (e: CustomEvent) { // pointlock.mousemove olayını dinle
            if (e.detail.enum === PointLockEventEnum.MOUSEMOVE) {
                // Fare hareketi ile ekranın X ve Y eksenindeki kaymaları güncelle
                screenMoveX = MathUtils.clamp(screenMoveX + e.detail.movementX, -256, 256);
                screenMoveY = MathUtils.clamp(screenMoveY + e.detail.movementY, -256, 256);
            }
        })
        this.initCameraStatus(); // Kameranın başlangıç konumunu ayarla
        this.addHandMesh(); // El modelini yükle
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        if (this.animationMixer) this.animationMixer.update(deltaTime);
        if (!GameContext.PointLock.isLocked) return;

        // Kamera hareketini kontrol etmek için yardımcı değişkenler
        deltaZUtil = 0;
        deltaYUtil = 0;

        // 1. Fare ile ekranın X eksenindeki kayma, kameranın Z ekseninde değişikliğe neden olur
        const cameraDeltaZ = MathUtils.mapLinear(screenMoveX, -256, 256, -mouseFloatX, mouseFloatX);
        deltaZUtil += cameraDeltaZ;

        // 2. Fare ile ekranın Y eksenindeki kayma, kameranın Y ekseninde değişikliğe neden olur
        const cameraDeltaY = MathUtils.mapLinear(screenMoveY, -256, 256, -mouseFloatY, mouseFloatY);
        deltaYUtil += cameraDeltaY;

        // 3. Solunum hareketi ile Y ekseninde hareket
        const sinDeltaTime = (Math.sin(elapsedTime) + 1) / 2;
        const breathDelta = MathUtils.lerp(-breathFloatScale, breathFloatScale, sinDeltaTime);
        deltaYUtil += breathDelta;

        // 4. Kameranın konumunu güncelle
        this.camera.position.z = cameraDefaultPosition.z + deltaZUtil;
        this.camera.position.y = cameraDefaultPosition.y - deltaYUtil;

        // Fare hareketine bağlı olarak X ve Y eksenindeki kaymaları azalt
        const base = deltaTime;
        if (screenMoveX > 0) screenMoveX = Math.min(0, screenMoveX - base);
        else if (screenMoveX < 0) screenMoveX = Math.max(0, screenMoveX + base);
        if (screenMoveY > 0) screenMoveY = Math.min(0, screenMoveY - base);
        else if (screenMoveY < 0) screenMoveY = Math.max(0, screenMoveY + base);
    }


    /** El modelinin kamera konumunu başlat (Blender ile uyumlu) */
    initCameraStatus() {
        this.camera = GameContext.Cameras.HandModelCamera;
        this.camera.clearViewOffset();
        this.camera.near = 0.001;
        this.camera.far = 999;
        this.camera.fov = 70; // 60 ~ 80
        this.camera.scale.z = 1.5; // 1 ~ 1.6
        this.camera.position.set(-1.6, 1.4, 0);
        cameraDefaultPosition.copy(this.camera.position);
        this.camera.rotation.y = - Math.PI / 2;
    }


    /** El modelini sahneye ekle */
    addHandMesh() {
        const armature = GameContext.GameResources.resourceMap.get('Armature') as THREE.Object3D;
        const arms = GameContext.GameResources.resourceMap.get('Arms') as THREE.SkinnedMesh;
        arms.material = this.localPlayer.roleMaterial;
        arms.frustumCulled = false;
        this.animationMixer = GameContext.GameResources.resourceMap.get('AnimationMixer') as THREE.AnimationMixer;
        arms.visible = true;
        this.scene.add(armature);
        this.scene.add(arms);
    }

}