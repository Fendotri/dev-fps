import { WeaponInterface } from './WeaponInterface';
import { WeaponSystem } from '../WeaponSystem';
import { WeaponClassificationEnum } from '@src/gameplay/abstract/WeaponClassificationEnum';
import { GameContext } from '@src/core/GameContext';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { UserInputEvent, UserInputEventPipe } from '@gameplay/pipes/UserinputEventPipe';
import { UserInputEventEnum, WeaponAnimationEventEnum } from '@gameplay/abstract/EventsEnum';
import { AnimationEventPipe, WeaponAnimationEvent } from '@gameplay/pipes/AnimationEventPipe';
import { GameLogicEventPipe, WeaponFireEvent } from '@gameplay/pipes/GameLogicEventPipe';
import { LinearInterpolant, LoopOnce, LoopRepeat, MathUtils, Vector2 } from 'three';


// Geri tepme ile ilgili yardımcı değişkenler
let startRecover = true; // Bir sonraki çerçevenin iyileşme başlangıcı olup olmadığı
let startRecoverLine = 0; // İyileşmeye başlarken geri tepme çizgisi
let cameraRotateTotalX = 0; // Geri tepme etkilerinden toplam kamera dönüşü
let cameraRotateTotalY = 0;
let cameraRotationBasicTotal = 0; // Temel yukarı-aşağı kamera sallanması
let recovercameraRotateTotalX = 0; // İyileşmesi gereken toplam kamera geri tepmesi
let recovercameraRotateTotalY = 0;
const bPointRecoiledScreenCoord: THREE.Vector2 = new Vector2(); // Ateşlendikten sonra geri tepme etkilenmiş nokta

/** 
 * Otomatik silahlar için soyut sınıf 
 */
export abstract class AutomaticWeapon implements CycleInterface, LoopInterface, WeaponInterface {
    private weaponSystem: WeaponSystem = WeaponSystem.getInstance(); // Silah sistemi örneği
    private animationMixer: THREE.AnimationMixer; // Silah animasyon karıştırıcı
    private weaponSkinnedMesh: THREE.SkinnedMesh; // 3D silah mesh'i
    private camera: THREE.Camera = GameContext.Cameras.PlayerCamera; // Geri tepme hesaplamaları için oyuncu kamerası
    private scene: THREE.Scene = GameContext.Scenes.Handmodel; // Silahın render edileceği sahne

    // Silahın durumu ile ilgili örnek değişkenler
    lastFireTime: number = 0; // Silahın en son ateşlendiği zaman (milisaniye)
    bulletLeftMagzine: number; // Mevcut şarjörde kalan mermiler
    bulletLeftTotal: number; // Toplam kalan mermiler
    active: boolean = false; // Silahın aktif olup olmadığı (ekipman animasyonu tamamlandığında etkinleşir)

    // Silah özellikleri
    weaponUUID = MathUtils.generateUUID(); // Silah örneği için benzersiz tanımlayıcı
    weaponClassificationEnum: WeaponClassificationEnum; // Silahın sınıflandırma türü
    weaponName: string; // Silahın adı
    weaponNameSuffix: string; // Silahın adı ekleri (örneğin sürüm numarası)
    magazineSize: number; // Silahın şarjör kapasitesi
    recoverTime: number; // Geri tepme iyileşme süresi
    speed: number; // Silah tutarken hareket hızı
    killaward: number; // Silahın öldürme ödülleri
    damage: number; // Silahın verdiği hasar
    fireRate: number; // Ateşleme hızı (saniye başına atış)
    recoilControl: number; // Geri tepme kontrol faktörü (kamera eğimini etkiler)
    accurateRange: number; // İlk merminin hedefe 30 cm içerisinde kesin olarak gittiği mesafe
    armorPenetration: number; // Zırh delme kapasitesi

    // Otomatik silah özel özellikleri
    recoverLine: number = 0; // Toplam geri tepme sapması
    bulletPosition: Array<number>; // Mermi için 2D yol örnekleme noktaları
    bulletPositionDelta: Array<number>; // Her atış için sapma değerleri
    bulletPositionInterpolant: THREE.LinearInterpolant; // Mermi yolunda örnekleme aralığı
    bulletPositionDeltaInterpolant: THREE.LinearInterpolant; // Mermi sapmalarındaki değişiklik için interpolasyon


    // Silah animasyon aksiyonları
    private equipAnim: THREE.AnimationAction;
    private reloadAnim: THREE.AnimationAction;
    private fireAnim: THREE.AnimationAction;
    private holdAnim: THREE.AnimationAction;
    private viewAnim: THREE.AnimationAction;

    /**
     * Otomatik silah için constructor metodu
     * @param bulletPosition 2D yol noktaları
     * @param bulletPositionDelta 2D sapma değerleri
     */
    constructor(bulletPosition: Array<number>, bulletPositionDelta: Array<number>) {
        this.bulletPosition = bulletPosition;
        this.bulletPositionDelta = bulletPositionDelta;
    }

    init() {
        const positions = []; // Örnekleme noktaları dizisi
        for (let i = 0; i < this.magazineSize; i++) positions[i] = i * this.fireRate; // Ateşleme hızına göre örnekleme noktaları oluştur

        // Mermi pozisyonu ve delta interpolantlarını başlat
        this.bulletPositionInterpolant = new LinearInterpolant(
            new Float32Array(positions), // Parametre noktaları
            new Float32Array(this.bulletPosition), // Değerler
            2, // Örnekleme büyüklüğü
            new Float32Array(2) // Interpolasyon sonucu için tampon
        );

        this.bulletPositionDeltaInterpolant = new LinearInterpolant(
            new Float32Array(positions), // Parametre noktaları
            new Float32Array(this.bulletPositionDelta), // Değerler
            2, // Örnekleme büyüklüğü
            new Float32Array(2) // Interpolasyon sonucu için tampon
        );

        // Kullanıcı giriş etkinliklerini silah aksiyonlarıyla dinleme
        UserInputEventPipe.addEventListener(UserInputEvent.type, (e: typeof UserInputEvent) => {
            if (!this.active) return;
            switch (e.detail.enum) {
                case UserInputEventEnum.BUTTON_RELOAD: // Yeniden yükleme butonuna basıldı
                    if (this.magazineSize <= this.bulletLeftMagzine) return; // Eğer şarjör doluysa tekrar yüklemeye gerek yok
                    this.active = false;
                    WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.RELOAD;
                    WeaponAnimationEvent.detail.weaponInstance = this;
                    AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Yükleme animasyonunu tetikle
                    break;
                case UserInputEventEnum.BUTTON_TRIGGLE_UP: // Tetik bırakıldı
                    if (this.bulletLeftMagzine > 0) return; // Eğer mermi kalmamışsa yeniden yükle
                    this.active = false;
                    WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.RELOAD;
                    WeaponAnimationEvent.detail.weaponInstance = this;
                    AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Yükleme animasyonunu tetikle
                    break;
            }
        })


    }

    /** Silah animasyonlarını başlat */
    initAnimation() {
        const equipAnimName = `${this.weaponName}_equip`; // Ekipman animasyonu
        const reloadAnimName = `${this.weaponName}_reload`; // Yeniden yükleme animasyonu
        const fireAnimName = `${this.weaponName}_fire`; // Ateş etme animasyonu
        const holdAnimName = `${this.weaponName}_hold`; // Tutuş animasyonu
        const viewAnimName = `${this.weaponName}_view`; // İnceleme animasyonu

        this.weaponSkinnedMesh = GameContext.GameResources.resourceMap.get(`${this.weaponName}_1`) as THREE.SkinnedMesh; // Silah mesh'ini al
        this.animationMixer = GameContext.GameResources.resourceMap.get('AnimationMixer') as THREE.AnimationMixer; // Animasyon karıştırıcısını al

        // Silah mesh'ini sahneye ekle
        this.scene.add(this.weaponSkinnedMesh);

        // İlgili animasyonları al
        this.equipAnim = GameContext.GameResources.resourceMap.get(equipAnimName) as THREE.AnimationAction;
        if (this.equipAnim) this.equipAnim.loop = LoopOnce; // Ekipman animasyonu sadece bir kez oynar
        this.reloadAnim = GameContext.GameResources.resourceMap.get(reloadAnimName) as THREE.AnimationAction;
        if (this.reloadAnim) this.reloadAnim.loop = LoopOnce; // Yeniden yükleme animasyonu sadece bir kez oynar
        this.fireAnim = GameContext.GameResources.resourceMap.get(fireAnimName) as THREE.AnimationAction;
        if (this.fireAnim) this.fireAnim.loop = LoopOnce; // Ateş etme animasyonu sadece bir kez oynar
        this.holdAnim = GameContext.GameResources.resourceMap.get(holdAnimName) as THREE.AnimationAction;
        if (this.holdAnim) this.holdAnim.loop = LoopRepeat; // Tutuş animasyonu sürekli döner
        this.viewAnim = GameContext.GameResources.resourceMap.get(viewAnimName) as THREE.AnimationAction;
        if (this.viewAnim) this.viewAnim.loop = LoopOnce; // İnceleme animasyonu sadece bir kez oynar

        // Animasyon bitişlerini dinleyerek durumları değiştir
        this.animationMixer.addEventListener('finished', (e: any) => {
            if (e.type === 'finished') {
                switch (e.action._clip.name) {
                    case equipAnimName: // Ekipman animasyonu bittiğinde
                        this.active = true; // Silahı etkinleştir
                        break;
                    case reloadAnimName: // Yeniden yükleme animasyonu bittiğinde
                        this.bulletLeftMagzine = this.magazineSize; // Şarjörü doldur
                        this.active = true; // Silahı etkinleştir
                        break;
                }
            }
        })

        // Silah animasyon olaylarını dinleyerek belirli animasyonları tetikle
        AnimationEventPipe.addEventListener(WeaponAnimationEvent.type, (e: CustomEvent) => {
            if (e.detail.weaponInstance !== this) return; // Sadece bu silah örneği için olayları işle
            switch (e.detail.enum) {
                case WeaponAnimationEventEnum.RELIEVE_EQUIP: // Ekipman çıkartıldığında
                    this.weaponSkinnedMesh.visible = false; // Silahı gizle
                    this.active = false; // Silahı devre dışı bırak
                    this.animationMixer.stopAllAction(); // Tüm animasyonları durdur
                    if (this.holdAnim) this.holdAnim.reset(); // Duraklatma animasyonunu sıfırla
                    if (this.reloadAnim) this.reloadAnim.reset(); // Yeniden yükleme animasyonunu sıfırla
                    if (this.equipAnim) this.equipAnim.reset(); // Ekipman animasyonunu sıfırla
                    if (this.fireAnim) this.fireAnim.reset(); // Ateş animasyonunu sıfırla
                    if (this.viewAnim) this.viewAnim.reset(); // Görünüm animasyonunu sıfırla
                    break;
                case WeaponAnimationEventEnum.EQUIP: // Ekipman
                    this.weaponSkinnedMesh.visible = true; // Silah görünür
                    this.holdAnim.play(); // Tutma animasyonunu oynat
                    this.equipAnim.weight = 49; // Ekipman animasyonunun ağırlığını ayarla
                    this.equipAnim.reset(); // Ekipman animasyonunu sıfırla
                    this.equipAnim.play(); // Ekipman animasyonunu başlat
                    this.active = false; // Ekipman animasyonu oynatılırken silah aktif değil
                    break;
                case WeaponAnimationEventEnum.FIRE: // Ateş etme
                    this.fireAnim.weight = 49; // Ateş animasyonunun ağırlığını ayarla
                    this.fireAnim.reset(); // Ateş animasyonunu sıfırla
                    this.fireAnim.play(); // Ateş animasyonunu başlat
                    break;
                case WeaponAnimationEventEnum.RELOAD: // Yeniden yükleme olayında
                    this.reloadAnim.weight = 49; // Yeniden yükleme animasyonunun ağırlığını ayarla
                    this.reloadAnim.reset(); // Yeniden yükleme animasyonunu sıfırla
                    this.reloadAnim.play(); // Yeniden yükleme animasyonunu başlat
                    this.active = false; // Yeniden yükleme sırasında silah aktif değil
                    break;
            }
        })
    }

    // Ateş etme işlemi
    fire() {
        // Eğer önceki aşamada geri tepme durumu başlamışsa, geri tepme toplamını sıfırlıyoruz
        if (!startRecover) {
            cameraRotateTotalX = recovercameraRotateTotalX;
            cameraRotateTotalY = recovercameraRotateTotalY;
        }

        // Temel mermi noktasını alıyoruz ve doğruluğa göre düzeltiyoruz
        const floatTypedArray0 = this.bulletPositionInterpolant.evaluate(this.recoverLine); // Mermi pozisyonunu interpolasyonla al
        bPointRecoiledScreenCoord.set(floatTypedArray0[0], floatTypedArray0[1]); // Silahın doğruluğuna göre mermi noktası
        const deltaRecoiledX = (1 / this.accurateRange) * (Math.random() - 0.5); // X ekseninde doğruluğa göre rastgele sapma
        const deltaRecoiledY = (1 / this.accurateRange) * Math.random(); // Y ekseninde doğruluğa göre rastgele sapma
        bPointRecoiledScreenCoord.x += deltaRecoiledX;
        bPointRecoiledScreenCoord.y += deltaRecoiledY;

        // Kamera yatay hareketi (Pitch)
        const basicPitch = 0.02 * Math.PI * (1 / this.recoilControl);
        this.camera.rotation.x += basicPitch;
        cameraRotationBasicTotal += basicPitch; // Kamera hareketi toplamını güncelle

        // Kamera sapma hareketi (Yaw ve Pitch)
        const floatTypedArray1 = this.bulletPositionDeltaInterpolant.evaluate(this.recoverLine);
        const deltaYaw = - floatTypedArray1[0] * Math.PI * (1 / this.recoilControl); // Merminin yatay hareketine göre kamera yönü
        const deltaPitch = floatTypedArray1[1] * Math.PI * (1 / this.recoilControl); // Merminin dikey hareketine göre kamera yönü
        this.camera.rotation.x += deltaPitch;
        this.camera.rotation.y += deltaYaw; // Y ekseninde kamera yönü
        cameraRotateTotalX += deltaPitch; // Kamera hareket toplamını güncelle
        cameraRotateTotalY += deltaYaw;

        // Ateş etme sonrası işlemler
        this.recoverLine += this.fireRate; // Geri tepme miktarını güncelle
        this.bulletLeftMagzine -= 1; // Mermi sayısını bir azalt
        startRecover = true; // Bir sonraki karede geri tepme başlayacak

        // Ateş etme animasyonunu tetikle
        WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.FIRE;
        WeaponAnimationEvent.detail.weaponInstance = this;
        AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Animasyon olayını gönder

        // Ateş etme sonrası mantık işlemi
        WeaponFireEvent.detail.bPointRecoiledScreenCoord = bPointRecoiledScreenCoord; // Mermi noktasını geri tepme ile güncelle
        WeaponFireEvent.detail.weaponInstance = this;
        GameLogicEventPipe.dispatchEvent(WeaponFireEvent); // Mantık olayını gönder

        // UI olmadığı için, sadece konsola mermi sayısını yazdır
        console.log(`fire: ${this.bulletLeftMagzine} / ${this.magazineSize}`);
    }

    // Kamera ve hedef geri tepme ayarları
    recover(deltaTime?: number, elapsedTime?: number): void {
        if (cameraRotationBasicTotal > 0) {
            if (cameraRotationBasicTotal - 0.01 > 0) {
                this.camera.rotation.x -= 0.01;
                cameraRotationBasicTotal -= 0.01;
            } else {
                this.camera.rotation.x -= cameraRotationBasicTotal;
                cameraRotationBasicTotal = 0;
            }
        }
        const triggleDown = this.weaponSystem.triggleDown;
        let deltaRecoverScale = deltaTime / this.recoverTime; // Her deltaTime için geri tepme miktarı
        if (!triggleDown || this.bulletLeftMagzine <= 0 || !this.active) { // Tetik basılı değil | Mermi bitmiş | Silah aktif değil
            if (startRecover) { // Eğer bu kare geri tepme için ilkse
                recovercameraRotateTotalX = cameraRotateTotalX; // Geri tepme için toplam değerleri kaydet
                recovercameraRotateTotalY = cameraRotateTotalY;
                startRecoverLine = this.recoverLine;
            }
            // Eğer geri tepme yapılacaksa
            if (this.recoverLine !== 0) { // 需要恢复准星
                const recoverLineBeforeMinus = this.recoverLine;
                if (this.recoverLine - (deltaRecoverScale * startRecoverLine) > 0) this.recoverLine -= (deltaRecoverScale * startRecoverLine);
                else { // Geri tepme miktarı sıfırın altına inerse
                    deltaRecoverScale = this.recoverLine / startRecoverLine;
                    this.recoverLine = 0; // 膛线插值恢复
                    cameraRotateTotalX = 0;
                    cameraRotateTotalY = 0;
                    recovercameraRotateTotalX = 0;
                    recovercameraRotateTotalY = 0;
                }
                const minusScale = recoverLineBeforeMinus - this.recoverLine;
                const recoverLineScale = minusScale / startRecoverLine;
                const deltaYaw = cameraRotateTotalY * recoverLineScale;
                const deltaPitch = cameraRotateTotalX * recoverLineScale;
                this.camera.rotation.x -= deltaPitch;
                this.camera.rotation.y -= deltaYaw; // Kamera rotasını ayarla
                recovercameraRotateTotalX -= deltaPitch;
                recovercameraRotateTotalY -= deltaYaw;
                startRecover = false; // Bir sonraki kare geri tepme başlangıcı değil
            }
        }

    }

    // Her karede yapılacak işlemler
    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        if (!GameContext.PointLock.isLocked) return; // Eğer noktalar kilitlenmişse işlemi durdur
        if (!this.active) return; // Silah aktif değilse işlemi durdur
        if (this.bulletLeftMagzine <= 0) return; // Mermi bitmişse işlemi durdur
        if (!this.weaponSystem.triggleDown) return; // Tetik basılı değilse işlemi durdur
        if (performance.now() - this.lastFireTime >= this.fireRate * 1000) { // Ateş etme aralığı yeterli mi?
            this.lastFireTime = performance.now();
            this.fire(); // Ateş etme işlemini gerçekleştir
        }
    }
}