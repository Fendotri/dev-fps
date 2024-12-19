import { WeaponClassificationEnum } from '@src/gameplay/abstract/WeaponClassificationEnum';

/** Silah arayüzü */
export type WeaponInterface = {

    active: boolean; // Silah aktif mi?
    lastFireTime: number; // Son ateşleme zamanı (ms)
    bulletLeftMagzine: number; // Mevcut şarjör içinde kalan mermi sayısı
    bulletLeftTotal: number; // Toplam kalan mermi sayısı

    weaponUUID: string; // Silahın benzersiz kimliği
    weaponClassificationEnum: WeaponClassificationEnum; // Silah türü
    weaponName: string; // Silah adı
    weaponNameSuffix: string; // Silahın ek ismi
    magazineSize: number; // Şarjör kapasitesi
    recoverTime: number; // Mermi geri alma süresi
    speed: number; // Taşıma hızı
    killaward: number; // Öldürme ödülü
    damage: number; // Hasar miktarı
    fireRate: number; // Ateş hızı
    recoilControl: number; // Nişan alma kontrolü, geri tepme
    accurateRange: number; // Doğru mesafe, bu mesafede ilk mermi hedefe 30 cm içinde isabet eder
    armorPenetration: number; // Zırh delme yeteneği

    muzzlePosition?: THREE.Vector3; // Namlu pozisyonu, duman ve alev için
    chamberPosition?: THREE.Vector3; // Kovan pozisyonu, kovanlar için

    init?: () => void;
    callEveryFrame?: (deltaTime?: number, elapsedTime?: number) => void; // Her karede çağrılır, sadece mevcut silah için
    recover?: (deltaTime?: number, elapsedTime?: number) => void;
    fire?: () => void;

}