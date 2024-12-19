import { GameContext } from '@src/core/GameContext';
import { dealWithWeaponTexture } from '@src/core/lib/threejs_common';
import { DoubleSide, MeshBasicMaterial } from 'three';
import { DaggerWeapon } from '../abstract/DaggerWeapon';

export class M9 extends DaggerWeapon {

    constructor() {
        super();

        // Silah modelini al
        const skinnedMesh = GameContext.GameResources.resourceMap.get('M9_1') as THREE.SkinnedMesh;
        // Silahın dokusunu yükle
        const texture = GameContext.GameResources.textureLoader.load('/weapons/weapon.M9.jpg');
        dealWithWeaponTexture(texture);
        // Malzemeyi oluştur ve uygulama
        const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
        skinnedMesh.material = material;

        this.weaponName = 'M9'; // Silah adı
        this.initAnimation(); // Animasyonu başlat
    }

}