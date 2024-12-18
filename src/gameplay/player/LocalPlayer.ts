
import { AK47 } from "../weapon/instances/AK47";
import { USP } from "../weapon/instances/USP";
import { M9 } from "../weapon/instances/M9";
import { LoopInterface } from '../../core/inferface/LoopInterface';
import { UserInputSystem } from '../input/UserInputSystem';
import { WeaponSystem } from '../weapon/WeaponSystem';
import { InventorySystem } from '../Inventory/InventorySystem';
import { FPSCameraController } from '../input/controllers/FPSCameraController';
import { MovementController } from '../input/controllers/MovementController';
import { GameContext } from '../../core/GameContext';
import { InventorySlotEnum } from '../abstract/InventorySlotEnum';
import { dealWithRoleMaterial, dealWithRoleTexture } from '@src/core/lib/threejs_common';
import { CycleInterface } from '../../core/inferface/CycleInterface';
import { MeshBasicMaterial } from 'three';

// Oyuncunun karakterinin dokusu yükleniyor ve işleniyor
const roleTexture = GameContext.GameResources.textureLoader.load('/role/role.TF2.heavy.png');
dealWithRoleTexture(roleTexture); // Texture işleme
const roleMaterial = new MeshBasicMaterial({ map: roleTexture });
dealWithRoleMaterial(roleMaterial); // Material işleme

/**
 * Yerel oyuncu sınıfı
 * Oyuncunun tüm etkileşimlerini (giriş, hareket, envanter, silahlar) yönetir.
 */
export class LocalPlayer implements CycleInterface, LoopInterface {
    // Singleton deseni için yerel oyuncu örneği
    private static localPlayerInstance: LocalPlayer;
    // Private constructor, tek bir örnek oluşturulmasına izin verir
    private constructor() { }
    // Singleton getInstance metodu
    public static getInstance(): LocalPlayer {
        if (!this.localPlayerInstance) this.localPlayerInstance = new LocalPlayer();
        return this.localPlayerInstance;
    }

    // Yerel oyuncu başlatma fonksiyonu
    init() {
        // Kullanıcı giriş sistemini başlat
        this.userInputSystem = new UserInputSystem();
        this.weaponSystem = WeaponSystem.getInstance(); // Silah sistemi

        // Kamera kontrolcüsü başlatılıyor
        this.cameraController = new FPSCameraController(); // 相机控制器
        this.cameraController.init();

        // Hareket kontrolcüsü başlatılıyor
        this.movementController = new MovementController(); // 移动控制器
        this.movementController.init();

        // Envanter sistemi başlatılıyor
        this.inventorySystem = new InventorySystem(); // 物品栏
        this.inventorySystem.init();

        // Silahları başlat ve envantere ekle
        const ak47 = new AK47();
        this.inventorySystem.pickUpWeapon(ak47); // AK47'yi al
        const usp = new USP();
        this.inventorySystem.pickUpWeapon(usp); // USP'yi al
        const m9 = new M9(); 
        this.inventorySystem.pickUpWeapon(m9); // M9'u al

        // Ana silahı tak
        this.inventorySystem.switchEquipment(InventorySlotEnum.Primary);
    }

    // Sistem bileşenleri
    userInputSystem: UserInputSystem; // Kullanıcı girişlerini işler
    inventorySystem: InventorySystem; // Envanter ve silah bilgilerini yönetir
    weaponSystem: WeaponSystem; // Silahlarla ilgili bilgileri ve animasyonları yönetir

    cameraController: FPSCameraController; // FPS kamera kontrolü
    movementController: MovementController; // Oyuncu hareketi yönetimi

    // Oyuncunun materyali (görsel) 
    roleMaterial: THREE.Material = roleMaterial; // Oyuncu materyali

    // Frame başına güncellemeleri işler
    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        this.movementController.callEveryFrame(deltaTime, elapsedTime); // Hareket kontrolcüsünü güncelle
        this.inventorySystem.callEveryFrame(deltaTime, elapsedTime); // Envanter sistemini güncelle
    }

}