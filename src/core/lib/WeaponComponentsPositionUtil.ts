import { Vector3 } from 'three';
import { GameContext } from '@src/core/GameContext';
import { GameLogicEventPipe, WeaponEquipEvent } from '@src/gameplay/pipes/GameLogicEventPipe';

const v3Util = new Vector3();

const cameraLookAt = new Vector3(0, 0, -1); // Varsayılan kamera bakış yönü
const cameraUp = new Vector3(0, 1, 0); // Varsayılan kamera üst yönü

const chamberPositionUtil = new Vector3();
const muzzlePositionUtil = new Vector3();

/**
 * Silah değiştirme olaylarını dinler ve geçerli silahın odak noktası ve namlu pozisyonunu
 * Blender koordinat sistemindeki konumlarına göre dinamik olarak hesaplar.
 * Bu iki API, sırasıyla:
 * 1. Namlu pozisyonu: Her ateş ettiğinizde, dünyada duman efekti yaymak için kullanılır.
 * 2. Silah namlu pozisyonu: Işık izi (tracer) mermisinin başlangıç noktası.
 */
export class WeaponComponentsPositionUtil {

    static instance: WeaponComponentsPositionUtil;
    public static getInstance() {
        if (!WeaponComponentsPositionUtil.instance) WeaponComponentsPositionUtil.instance = new WeaponComponentsPositionUtil();
        return WeaponComponentsPositionUtil.instance;
    }
    handModelCamera: THREE.PerspectiveCamera = GameContext.Cameras.HandModelCamera; // El modeli kamerasının mevcut konumunu alır
    playerCamera = GameContext.Cameras.PlayerCamera;

    chamberFrontDelta: number = 0;
    chamberRightDelta: number = 0;
    chamberDownDelta: number = 0;

    muzzleFrontDelta: number = 0;
    muzzleRightDelta: number = 0;
    muzzleDownDelta: number = 0;

    frontDirection = new Vector3();
    rightDirection = new Vector3();
    downDirection = new Vector3();

    private constructor() {

        // Silah değiştirme olayını dinleyip, el modelinin pozisyonuna göre odak noktası ve namlu pozisyonunu hesaplar
        GameLogicEventPipe.addEventListener(WeaponEquipEvent.type, (e: CustomEvent) => { // Silah değişim olayını dinler
            const _weaponInstance = WeaponEquipEvent.detail.weaponInstance;
            if (_weaponInstance && _weaponInstance.chamberPosition) { // Eğer silahın odak noktası (chamberPosition) varsa
                v3Util.copy(_weaponInstance.chamberPosition); // Odak noktasını al
                // Odak noktası ve namlu pozisyonunu günceller
                this.chamberFrontDelta = v3Util.x - this.handModelCamera.position.x;
                this.chamberRightDelta = v3Util.z - this.handModelCamera.position.z;
                this.chamberDownDelta = v3Util.y - this.handModelCamera.position.y;
            }

            // Namlu pozisyonu
            if (_weaponInstance && _weaponInstance.muzzlePosition) {
                v3Util.copy(_weaponInstance.muzzlePosition);
                this.muzzleFrontDelta = v3Util.x - this.handModelCamera.position.x;
                this.muzzleRightDelta = v3Util.z - this.handModelCamera.position.z;
                this.muzzleDownDelta = v3Util.y - this.handModelCamera.position.y;
            }
        })
    }

    /**
     * Silahın odak noktasının (chamber) dünya üzerindeki konumunu hesaplar.
     * @returns Odak noktasının dünya koordinatlarındaki pozisyonu
     */
    public calculateChamberPosition(): THREE.Vector3 {

        // Silah değişim olayında zaten belirlenen değişkenler: frontDelta, rightDelta, downDelta

        // Kameranın bakış yönü, sağ yönü ve yukarı yönü hesaplanır

        v3Util.copy(cameraLookAt);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.frontDirection.copy(v3Util);

        v3Util.copy(cameraUp);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.downDirection.copy(v3Util);

        v3Util.copy(this.frontDirection);
        v3Util.cross(this.downDirection);
        v3Util.normalize();
        this.rightDirection.copy(v3Util);

        // Odak noktası pozisyonunu hesaplar

        chamberPositionUtil.copy(this.playerCamera.position);
        chamberPositionUtil.addScaledVector(this.frontDirection, this.chamberFrontDelta); // 向前
        chamberPositionUtil.addScaledVector(this.rightDirection, this.chamberRightDelta); // 右方
        chamberPositionUtil.addScaledVector(this.downDirection, this.chamberDownDelta); // 下方

        return chamberPositionUtil;

    }

    /**
     * Silahın namlusunun (muzzle) dünya üzerindeki konumunu hesaplar.
     * @returns Namlunun dünya koordinatlarındaki pozisyonu
     */
    public calculateMuzzlePosition(): THREE.Vector3 {

        // Silah değişim olayında zaten belirlenen değişkenler: frontDelta, rightDelta, downDelta;

        // Kameranın bakış yönü, sağ yönü ve yukarı yönü hesaplanır

        v3Util.copy(cameraLookAt);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.frontDirection.copy(v3Util);

        v3Util.copy(cameraUp);
        v3Util.applyEuler(this.playerCamera.rotation);
        v3Util.normalize();
        this.downDirection.copy(v3Util);

        v3Util.copy(this.frontDirection);
        v3Util.cross(this.downDirection);
        v3Util.normalize();
        this.rightDirection.copy(v3Util);

        // Namlunun pozisyonunu hesaplar

        muzzlePositionUtil.copy(this.playerCamera.position);
        muzzlePositionUtil.addScaledVector(this.frontDirection, this.muzzleFrontDelta); // Öne doğru hareket
        muzzlePositionUtil.addScaledVector(this.rightDirection, this.muzzleRightDelta); // Sağ yönde hareket
        muzzlePositionUtil.addScaledVector(this.downDirection, this.muzzleDownDelta); // Aşağıya doğru hareket

        return muzzlePositionUtil;

    }

}