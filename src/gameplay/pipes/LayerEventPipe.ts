
import { DomPipe } from '@src/core/DOMPipe';
import { Vector2, Vector3 } from 'three';

/**
 * Tüm ekran render katmanlarıyla ilgili olayları yayınlamak için kullanılan pipe
 */
export const LayerEventPipe = new DomPipe();

/**
 * Merminin düşme noktasını render etmek için kullanılan olay
 * Bu olay, merminin yere düşüş noktasını, normalini ve ekran üzerindeki geri tepme etkisini işler.
 * - fallenPoint: Merminin yere düştüğü nokta
 * - fallenNormal: Merminin yere düştüğü yüzeyin normal vektörü
 * - cameraPosition: Merminin ateşlendiği kameranın konumu
 * - recoiledScreenCoord: Merminin ateşlenirken ekrandaki yansıyan pozisyonu
 */
export const BulletFallenPointEvent = new CustomEvent<{
    fallenPoint: THREE.Vector3;        // Merminin yere düştüğü nokta (3D koordinat)
    fallenNormal: THREE.Vector3;       // Merminin yere düştüğü yüzeyin normal vektörü
    cameraPosition: THREE.Vector3;     // Kameranın mermi ateşlerkenki konumu
    recoiledScreenCoord: THREE.Vector2; // Ekran üzerindeki geri tepme etkisiyle oluşan mermi pozisyonu
}>('bullet fallenpoint', {
    detail: {
        fallenPoint: new Vector3(),          // Başlangıçta boş bir 3D vektör
        fallenNormal: new Vector3(),         // Başlangıçta boş bir 3D vektör
        cameraPosition: new Vector3(),       // Başlangıçta boş bir 3D vektör
        recoiledScreenCoord: new Vector2(),  // Başlangıçta boş bir 2D vektör
    }
});

/** 
 * Dışarıdan ateş edilen bir silah için ateş etme olayı 
 */
export const ShotOutWeaponFireEvent = new CustomEvent<{}>('shoutoutweapon fired', {})