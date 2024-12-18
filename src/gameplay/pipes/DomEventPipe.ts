import { DomPipe } from '@src/core/DOMPipe';
import { PointLockEventEnum } from '@src/gameplay/abstract/EventsEnum';

/**
 * Tüm DOM elementleriyle yapılan işlemleri yaymak için kullanılan event pipe
 */
export const DomEventPipe = new DomPipe();

/**
 * PointLock olaylarını dinler, PointLock durumunu yayınlar
 * Aynı zamanda PointLock durumunda, manipülatörün hareketini izler
 */
export const PointLockEvent = new CustomEvent<{
    enum: PointLockEventEnum,   // PointLock olay türünü belirten enum
    movementX: number,         // X eksenindeki hareket miktarı
    movementY: number,         // Y eksenindeki hareket miktarı
}>('pointlock', {
    detail: { enum: 0, movementX: 0, movementY: 0 } // Başlangıçta PointLock durumunu ve hareket miktarlarını sıfırlıyoruz
});