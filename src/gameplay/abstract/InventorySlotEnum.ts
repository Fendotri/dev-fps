import { WeaponClassificationEnum } from './WeaponClassificationEnum';

/**
 * Envanter slot türleri
 */
export enum InventorySlotEnum {
    Hands, // Boş el
    Primary, // Ana silah
    Secondary, // Yan silah
    Malee, // Melee silah (Bıçak vb.)
}


/**
 * İlgili silah sınıflandırma türünün hangi envanter slotuna ait olduğunu belirler
 * @param weaponClassificationEnum : Silah sınıflandırma türü
 * @returns : Envanter slotu (silahın hangi slotta yer alacağı)
 */
export function mapIventorySlotByWeaponClassficationEnum(weaponClassificationEnum: WeaponClassificationEnum): InventorySlotEnum {
    switch (weaponClassificationEnum) {
        case WeaponClassificationEnum.Rifle:
            return InventorySlotEnum.Primary; // Tüfek -> Ana silah slotu
        case WeaponClassificationEnum.SniperRifle:
            return InventorySlotEnum.Primary; // Keskin nişancı tüfeği -> Ana silah slotu
        case WeaponClassificationEnum.Pistol:
            return InventorySlotEnum.Secondary; // Tabanca -> Yan silah slotu
        case WeaponClassificationEnum.Malee:
            return InventorySlotEnum.Malee; // Melee silah -> Melee slotu
        case WeaponClassificationEnum.SMG:
            return InventorySlotEnum.Primary; // Hafif makineli tüfek -> Ana silah slotu
        case WeaponClassificationEnum.Shotgun:
            return InventorySlotEnum.Primary; // Pompalı tüfek -> Ana silah slotu
        case WeaponClassificationEnum.Machinegun:
            return InventorySlotEnum.Primary; // Makineli tüfek -> Ana silah slotu
    }
}