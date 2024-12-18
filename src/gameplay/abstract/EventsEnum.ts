
/**
 * Fare işaretçisi kilitleme olayları
 */
export enum PointLockEventEnum {
    LOCK,  // Kilitleme
    UNLOCK,  // Kilidi açma
    MOUSEMOVE,  // Fare hareketi
};


/**
 * Kullanıcı giriş tuşları olayı
 */
export enum UserInputEventEnum {

    BUTTON_SWITCH_PRIMARY_WEAPON,  // Ana silaha geçiş
    BUTTON_SWITCH_SECONDARY_WEAPON,  // Yan silaha geçiş
    BUTTON_SWITCH_MALEE_WEAPON,  // Melee silahına (bıçak) geçiş
    BUTTON_SWITCH_LAST_WEAPON,  // Son kullanılan silaha geçiş
    BUTTON_RELOAD,  // Şarjör değiştirme
    BUTTON_TRIGGLE_DOWN,  // Tetik çekme (basma)
    BUTTON_TRIGGLE_UP,  // Tetik bırakma

    JUMP,  // Zıplama
    MOVE_FORWARD_DOWN,  // İleriye hareket etme
    MOVE_BACKWARD_DOWN,  // Geriye hareket etme
    MOVE_LEFT_DOWN,  // Sola hareket etme
    MOVE_RIGHT_DOWN,  // Sağa hareket etme
    MOVE_FORWARD_UP,  // İleri hareketi bırakma
    MOVE_BACKWARD_UP,  // Geri hareketi bırakma
    MOVE_LEFT_UP,  // Sola hareketi bırakma
    MOVE_RIGHT_UP,  // Sağa hareketi bırakma
}


/**
 * Silah animasyon olayları
 */
export enum WeaponAnimationEventEnum {
    HOLD,  // Silah tutma
    EQUIP,  // Silahı ekipman olarak takma
    RELIEVE_EQUIP,  // Silahı bırakma
    FIRE,  // Ateş etme
    RELOAD,  // Şarjör değiştirme
    PICKUP,  // Silahı alma
}