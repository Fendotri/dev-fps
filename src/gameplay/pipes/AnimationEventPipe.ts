

import { WeaponInterface } from '@src/gameplay/weapon/abstract/WeaponInterface'

import { DomPipe } from '@src/core/DOMPipe';
import { WeaponAnimationEventEnum } from '../abstract/EventsEnum';

/**
 * Tüm animasyonla ilgili olayları yayınlamak için kullanılan event pipe
 */
export const AnimationEventPipe = new DomPipe();

/**
 * Silahın ID'sini ve silah animasyon olaylarını [HOLD, EQUIP, RELIEVE_EQUIP, FIRE, RELOAD, PICKUP] kaydeder
 */
export const WeaponAnimationEvent = new CustomEvent<{
    enum: WeaponAnimationEventEnum,  // Olay türünü belirten enum
    weaponInstance: WeaponInterface   // Olayla ilişkilendirilmiş silah örneğ
}>('weapon animation', {
    detail: {
        enum: undefined, // Başlangıçta olay türü tanımlanmadı
        weaponInstance: undefined, // Başlangıçta silah örneği tanımlanmadı
    }
});