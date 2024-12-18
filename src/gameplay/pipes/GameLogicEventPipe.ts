import { WeaponInterface } from '../weapon/abstract/WeaponInterface';

import { DomPipe } from '@src/core/DOMPipe';
export const GameLogicEventPipe = new DomPipe();

/**
 * Silah sistemi ateş etme olayı
 * Bu olay, silah ateşlendiğinde tetiklenir.
 */
export const WeaponFireEvent = new CustomEvent<{
    bPointRecoiledScreenCoord: THREE.Vector2, // Merminin geri tepme hesaplamasından sonra ekran üzerindeki gerçek çıkış noktası
    weaponInstance: WeaponInterface, // Ateş eden silahın örneği
}>('weapon fired', {
    detail: {
        bPointRecoiledScreenCoord: undefined, // Başlangıçta geri tepme noktası belirtilmemiştir
        weaponInstance: undefined, // Başlangıçta silah örneği belirtilmemiştir
    }
});

/**
 * Silah sistemi ekipman değiştirme olayı
 * Bu olay, bir silah ekipmanı değiştirildiğinde tetiklenir.
 */
export const WeaponEquipEvent = new CustomEvent<{
    weaponInstance: WeaponInterface, // Yeni ekipman olarak seçilen silah
}>(
    'waepon equiped', {
    detail: { weaponInstance: undefined, } // Başlangıçta ekipmanlı silah belirtilmemiştir
});