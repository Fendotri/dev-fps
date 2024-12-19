import { AutomaticWeapon } from '../abstract/AutomaticWeapon';
import { AutomaticWeaponBPointsUtil } from "../utils/AutomaticWeaponBPointsUtil";
import { GameContext } from '@src/core/GameContext';
import { dealWithWeaponTexture } from '@src/core/lib/threejs_common';
import { WeaponClassificationEnum } from '@src/gameplay/abstract/WeaponClassificationEnum';
import { DoubleSide, MeshBasicMaterial, Vector3 } from 'three';

// AK47'nin mermi pozisyonlarını temsil eden dizi
const ak47BulletPositionArray = [
    222, 602, 230, 585, 222, 540, 228, 472, 231, 398,
    200, 320, 180, 255, 150, 208, 190, 173, 290, 183,
    343, 177, 312, 150, 350, 135, 412, 158, 420, 144,
    323, 141, 277, 124, 244, 100, 179, 102, 100, 124,
    149, 130, 134, 123, 149, 100, 170, 92, 125, 100,
    110, 87, 160, 88, 237, 95, 346, 147, 381, 146
]

// Mermi pozisyonlarını ekran koordinatlarına dönüştürme
const bulletPosition = AutomaticWeaponBPointsUtil.bulletPositionArray2ScreenCoordArray(ak47BulletPositionArray, 30, 0.2, 0.15, 1.4); 
// Mermi pozisyonunun kameradaki etkilerini hesaplama
const bulletPositionDelta = AutomaticWeaponBPointsUtil.bulletDeltaPositionArray2ScreenCoordArray(ak47BulletPositionArray, 30, 0.2, 0.15, 1); 

export class AK47 extends AutomaticWeapon {

    muzzlePosition: THREE.Vector3 = new Vector3(0.921, 1.057, 0.491); // Namlu pozisyonu
    chamberPosition: THREE.Vector3 = new Vector3(-0.276, 1.086, 0.565); // Kovan pozisyonu

    constructor() {
        super(bulletPosition, bulletPositionDelta); // Silahın mermi pozisyonlarını ve delta pozisyonlarını ayarla

        const skinnedMesh = GameContext.GameResources.resourceMap.get('AK47_1') as THREE.SkinnedMesh;
        const texture = GameContext.GameResources.textureLoader.load('/weapons/weapon.AK47.jpg'); // Silahın dokusunu yükle
        dealWithWeaponTexture(texture); // Silahın dokusunu işleme
        const material = new MeshBasicMaterial({ map: texture, side: DoubleSide }); // Malzeme ayarla
        skinnedMesh.material = material; // Modelin malzemesini ayarla

        this.weaponClassificationEnum = WeaponClassificationEnum.Rifle; // Silah türü: Tüfek
        this.weaponName = 'AK47'; // Silahın adı
        this.magazineSize = 30; // Şarjör kapasitesi
        this.fireRate = 60 / 600.0; // Ateş hızı
        this.recoverTime = 0.368; // Geri alma süresi
        this.reloadTime = 2.0; // Şarjör doldurma süresi
        this.recoilControl = 4; // Geri tepme kontrolü
        this.accurateRange = 120; // Doğru menzil

        this.bulletLeftMagzine = this.magazineSize; // Kalan mermi sayısı (şarjör)
        this.bulletLeftTotal = 90; // Toplam kalan mermi sayısı

        this.init(); // Başlangıç işlemlerini yap
        this.initAnimation(); // Animasyonları başlat
    }

}