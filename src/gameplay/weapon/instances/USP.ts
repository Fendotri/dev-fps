import { GameContext } from '@src/core/GameContext';
import { dealWithWeaponTexture } from '@src/core/lib/threejs_common';
import { WeaponClassificationEnum } from '@src/gameplay/abstract/WeaponClassificationEnum';
import { SemiAutomaticWeapon } from '../abstract/SemiAutomaticWeapon';
import { DoubleSide, MeshBasicMaterial, Vector3 } from 'three';

export class USP extends SemiAutomaticWeapon {

    muzzlePosition: THREE.Vector3 = new Vector3(0.887, 1.079, 0.494); // Namlu pozisyonu
    chamberPosition: THREE.Vector3 = new Vector3(0.109, 1.101, 0.579); // Kovan pozisyonu

    constructor() {
        super();
        // Silah modelini al
        const skinnedMesh = GameContext.GameResources.resourceMap.get('USP_1');
        // Silahın dokusunu yükle
        const texture = GameContext.GameResources.textureLoader.load('/weapons/weapon.USP.jpg');
        dealWithWeaponTexture(texture);
        // Malzemeyi oluştur ve modelin malzemesi olarak ayarla
        const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
        (skinnedMesh as THREE.SkinnedMesh).material = material;

        // Silahın özelliklerini ayarla
        this.weaponClassificationEnum = WeaponClassificationEnum.Pistol; // Silah türü: Tabanca
        this.weaponName = 'USP'; // Silah adı
        this.magazineSize = 12; // Şarjör kapasitesi
        this.fireRate = 0.17; // Ateş hızı
        this.recoverTime = 0.34; // Geri alma süresi
        this.reloadTime = 2.0; // Şarjör doldurma süresi
        this.recoilControl = 5; // Geri tepme kontrolü
        this.accurateRange = 120; // Doğru menzil

        this.bulletLeftMagzine = this.magazineSize; // Kalan mermi sayısı (şarjör)

        // Başlangıç işlemleri ve animasyonları başlat
        this.init();
        this.initAnimation();

    }

}