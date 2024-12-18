
import { WeaponInterface } from '../weapon/abstract/WeaponInterface';
import { InventorySlotEnum, mapIventorySlotByWeaponClassficationEnum } from '../abstract/InventorySlotEnum';
import { CycleInterface } from '../../core/inferface/CycleInterface';
import { LoopInterface } from '../../core/inferface/LoopInterface';
import { UserInputEvent, UserInputEventPipe } from '../pipes/UserinputEventPipe';
import { UserInputEventEnum, WeaponAnimationEventEnum } from '../abstract/EventsEnum';
import { AnimationEventPipe, WeaponAnimationEvent } from '../pipes/AnimationEventPipe';
import { GameLogicEventPipe, WeaponEquipEvent } from '../pipes/GameLogicEventPipe';


/**
 * Envanter Sistemi
 */
export class InventorySystem implements CycleInterface, LoopInterface {

    weapons: Map<InventorySlotEnum, WeaponInterface> = new Map<InventorySlotEnum, WeaponInterface>(); // Silahlar listesi, oyuncunun şu an sahip olduğu tüm silahlar
    nowEquipInventory: InventorySlotEnum = InventorySlotEnum.Hands; // Şu anki ekipman (silah)
    lastEquipInventory: InventorySlotEnum = InventorySlotEnum.Malee; // Önceki ekipman (silah), başta bıçak olarak başlatılıyor

    init(): void {
        this.weapons.set(InventorySlotEnum.Hands, null); // Silahı başlangıçta boş olarak ayarla
        this.switchEquipment(InventorySlotEnum.Hands); // Ekipman olarak silahı seç
        UserInputEventPipe.addEventListener(UserInputEvent.type, (e: CustomEvent) => { // Oyuncu tuşlarına basınca gerçekleşen olaylar
            switch (e.detail.enum) { // Envanterde silah değiştirme işlemleri
                case UserInputEventEnum.BUTTON_SWITCH_PRIMARY_WEAPON: // Ana silah
                    this.switchEquipment(InventorySlotEnum.Primary);
                    break;
                case UserInputEventEnum.BUTTON_SWITCH_SECONDARY_WEAPON: // İkincil silah
                    this.switchEquipment(InventorySlotEnum.Secondary);
                    break;
                case UserInputEventEnum.BUTTON_SWITCH_MALEE_WEAPON: // Bıçak
                    this.switchEquipment(InventorySlotEnum.Malee);
                    break;
                case UserInputEventEnum.BUTTON_SWITCH_LAST_WEAPON: // Son kullanılan silah
                    this.switchEquipment(this.lastEquipInventory);
                    break;
            }
        });
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        // Nişangahın geri kazanımı her frame'de yapılır, çünkü silah değiştirdikten sonra nişangah geri kazanılabilir
        this.weapons.forEach(weapon => { if (weapon && weapon.recover) weapon.recover(deltaTime, elapsedTime) });

        const nowEquipWeapon = this.weapons.get(this.nowEquipInventory);
        if (!nowEquipWeapon) return; // Eğer şu an hiç silah yoksa işlemi durdur
        if (nowEquipWeapon.callEveryFrame) nowEquipWeapon.callEveryFrame(deltaTime, elapsedTime); // Ekipmanlı silahın her frame'deki hesaplama fonksiyonunu çalıştır
    }

    /**
     * Hedef silaha geçiş yap
     * @param inventory Hedef silah slotu
     */
    switchEquipment(targetInventory: InventorySlotEnum) {
        const nowEquipInventory = this.nowEquipInventory;
        if (nowEquipInventory !== targetInventory) { // Eğer şu anki ekipman hedef ekipmanla farklıysa işlem yapılır
            // Eski silahın çıkarılması için animasyon olayını gönder
            WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.RELIEVE_EQUIP;
            if (this.weapons.get(nowEquipInventory)) WeaponAnimationEvent.detail.weaponInstance = this.weapons.get(nowEquipInventory);
            AnimationEventPipe.dispatchEvent(WeaponAnimationEvent);

            // Yeni silahın takılması için animasyon olayını gönder
            WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.EQUIP;
            if (this.weapons.get(targetInventory)) WeaponAnimationEvent.detail.weaponInstance = this.weapons.get(targetInventory);
            AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Silah sistemi katmanına gönderir

            WeaponEquipEvent.detail.weaponInstance = this.weapons.get(targetInventory);
            GameLogicEventPipe.dispatchEvent(WeaponEquipEvent); // Render katmanına gönderir

            this.nowEquipInventory = targetInventory; // Yeni ekipman olarak hedefi ayarla
            this.lastEquipInventory = nowEquipInventory; // Eski ekipmanı kaydet
        }
    }

    /** 
     * Yerden silah alma
     */
    pickUpWeapon(weaponInstance: WeaponInterface) {
        const belongInventory = mapIventorySlotByWeaponClassficationEnum(weaponInstance.weaponClassificationEnum); // Silahın hangi envanter slotuna ait olduğunu belirler
        if (!this.weapons.get(belongInventory)) this.weapons.set(belongInventory, weaponInstance); // Eğer slot boşsa, silahı al ve slotta sakla
    }

}