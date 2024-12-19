import { GameContext } from "@src/core/GameContext";
import { WeaponClassificationEnum } from '@src/gameplay/abstract/WeaponClassificationEnum';
import { UserInputEvent, UserInputEventPipe } from '@src/gameplay/pipes/UserinputEventPipe';
import { UserInputEventEnum, WeaponAnimationEventEnum } from '@src/gameplay/abstract/EventsEnum';
import { AnimationEventPipe, WeaponAnimationEvent } from '@src/gameplay/pipes/AnimationEventPipe';
import { GameLogicEventPipe, WeaponFireEvent } from '@src/gameplay/pipes/GameLogicEventPipe';
import { WeaponInterface } from './WeaponInterface';
import { LoopOnce, LoopRepeat, MathUtils, Vector2 } from 'three';

const bPointRecoiledScreenCoord: THREE.Vector2 = new Vector2(); // Ateş edildikten sonra geri tepme ile etkilenen mermi noktası

let startRecover: boolean = true;
let startRecoverLine: number = 0;
let cameraRotationBasicTotal = 0; // Yarı otomatik silahlar sadece pitch yönünden etkilenir
let recovercameraRotateTotalX = 0; // Yarı otomatik silahlar sadece pitch yönünden etkilenir

/**
 * Yarı otomatik silahlar için soyut sınıf
 */
export abstract class SemiAutomaticWeapon implements WeaponInterface {

    private animationMixer: THREE.AnimationMixer; // Animasyon/Karakter ağı karıştırıcı
    private weaponSkinnedMesh: THREE.SkinnedMesh; // Silah ağı
    private camera: THREE.Camera = GameContext.Cameras.PlayerCamera;
    private scene: THREE.Scene = GameContext.Scenes.Handmodel;

    // Silah durum değişkenleri
    lastFireTime: number = 0; // Son ateş etme zamanı (ms)
    bulletLeftMagzine: number; // Mevcut şarjörde kalan mermi sayısı
    bulletLeftTotal: number; // Toplam kalan mermi sayısı
    active: boolean = false; // Silah şu anda aktif mi (Ekipman animasyonu bittiğinde aktif duruma geçer)

    // Silah özellikleri
    weaponUUID = MathUtils.generateUUID(); // Bu silah nesnesinin benzersiz kimliği
    weaponClassificationEnum: WeaponClassificationEnum; // Silah türü
    weaponName: string; // Silah adı
    weaponNameSuffix: string; // Silah ek adı
    magazineSize: number; // Şarjör kapasitesi
    recoverTime: number; // Mermi yolu geri dönüş süresi
    reloadTime: number;
    speed: number; // Taşıma hızı
    killaward: number; // Öldürme ödülü
    damage: number; // Hasar
    fireRate: number; // Ateş hızı
    recoilControl: number; // Geri tepme kontrolü
    accurateRange: number; // Bu mesafede ilk mermi hedef tahtasında 30 cm içinde olacaktır
    armorPenetration: number; // Zırh delme yeteneği

    // Yarı otomatik silahlar
    recoverLine: number = 0;

    // Silah animasyonları
    private equipAnim: THREE.AnimationAction;
    private reloadAnim: THREE.AnimationAction;
    private fireAnim: THREE.AnimationAction;
    private holdAnim: THREE.AnimationAction;
    private viewAnim: THREE.AnimationAction;

    init() {
        // Klavye ile tetiklenen silah olaylarını dinleme
        UserInputEventPipe.addEventListener(UserInputEvent.type, (e: CustomEvent) => {
            if (!this.active) return; // Silah aktif değilse işlem yapma
            switch (e.detail.enum) {
                case UserInputEventEnum.BUTTON_RELOAD: // Yeniden doldurma tuşu
                    if (!this.active) return; // 1. Silah aktif değilse yeniden doldurulamaz
                    if (this.magazineSize <= this.bulletLeftMagzine) return; // 2. Şarjör zaten doluysa yeniden doldurulamaz
                    this.active = false;
                    WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.RELOAD;
                    WeaponAnimationEvent.detail.weaponInstance = this;
                    AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Silah yeniden doldurma olayı tetiklenir
                    break;
                case UserInputEventEnum.BUTTON_TRIGGLE_DOWN: // Tetiği çekme
                    if (!GameContext.PointLock.isLocked) return;
                    if (!this.active) return; // Silah aktif değilse ateş etme işlemi yapılamaz
                    if (this.bulletLeftMagzine <= 0) { // Eğer mermi kalmamışsa
                        this.active = false;
                        WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.RELOAD;
                        WeaponAnimationEvent.detail.weaponInstance = this;
                        AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Yeniden doldurma olayı tetiklenir
                        return;
                    }
                    if (performance.now() - this.lastFireTime >= this.fireRate * 1000) {
                        this.lastFireTime = performance.now();
                        this.fire();
                    }
                    break;
            }

        })

    }

    /** Animasyonları başlat */
    initAnimation() {

        const equipAnimName = `${this.weaponName}_equip`; // Donatma
        const reloadAnimName = `${this.weaponName}_reload`; // Yeniden doldurma
        const fireAnimName = `${this.weaponName}_fire`; // Ateş etme
        const holdAnimName = `${this.weaponName}_hold`; // Tutma
        const viewAnimName = `${this.weaponName}_view`; // İnceleme

        this.weaponSkinnedMesh = GameContext.GameResources.resourceMap.get(`${this.weaponName}_1`) as THREE.SkinnedMesh; // Silah ağı
        this.animationMixer = GameContext.GameResources.resourceMap.get('AnimationMixer') as THREE.AnimationMixer; // Animasyon karıştırıcı

        // Ağı sistemi ekleyin
        this.scene.add(this.weaponSkinnedMesh);


        this.equipAnim = GameContext.GameResources.resourceMap.get(equipAnimName) as THREE.AnimationAction;
        if (this.equipAnim) this.equipAnim.loop = LoopOnce;
        this.reloadAnim = GameContext.GameResources.resourceMap.get(reloadAnimName) as THREE.AnimationAction;
        if (this.reloadAnim) this.reloadAnim.loop = LoopOnce;
        this.fireAnim = GameContext.GameResources.resourceMap.get(fireAnimName) as THREE.AnimationAction;
        if (this.fireAnim) this.fireAnim.loop = LoopOnce;
        this.holdAnim = GameContext.GameResources.resourceMap.get(holdAnimName) as THREE.AnimationAction;
        if (this.holdAnim) this.holdAnim.loop = LoopRepeat; // Tutma animasyonu sürekli oynar
        this.viewAnim = GameContext.GameResources.resourceMap.get(viewAnimName) as THREE.AnimationAction;
        if (this.viewAnim) this.viewAnim.loop = LoopOnce;

        // Bazı animasyonlar sona erdiğinde parametreleri değiştirmek için geri çağrılar

        this.animationMixer.addEventListener('finished', (e: any) => {
            if (e.type === 'finished') {
                switch (e.action._clip.name) {
                    case equipAnimName: // Donatma animasyonu sona erdiğinde
                        this.active = true; // Aktif duruma geçer
                        break;
                    case reloadAnimName: // Yeniden doldurma animasyonu sona erdiğinde
                        this.bulletLeftMagzine = this.magazineSize; // Şarjör tamamen dolar
                        this.active = true; // Aktif duruma geçer
                        break;
                }
            }
        })

        // Silah olaylarını kabul et ve animasyonları işle
        AnimationEventPipe.addEventListener(WeaponAnimationEvent.type, (e: CustomEvent) => {
            if (e.detail.weaponInstance !== this) return; // Sadece mevcut silahın olaylarına yanıt ver
            switch (e.detail.enum) {
                case WeaponAnimationEventEnum.RELIEVE_EQUIP:  // Donatmayı kaldır
                    this.weaponSkinnedMesh.visible = false; // Silah görünmez hale gelir
                    this.active = false; // Aktif değil
                    this.animationMixer.stopAllAction(); // Tüm animasyonları durdur
                    if (this.holdAnim) this.holdAnim.reset();
                    if (this.reloadAnim) this.reloadAnim.reset();
                    if (this.equipAnim) this.equipAnim.reset();
                    if (this.fireAnim) this.fireAnim.reset();
                    if (this.viewAnim) this.viewAnim.reset();
                    break;
                case WeaponAnimationEventEnum.EQUIP: // Donatma
                    this.weaponSkinnedMesh.visible = true; // Silah görünür hale gelir
                    this.holdAnim.play();
                    this.equipAnim.weight = 49;
                    this.equipAnim.reset(); // Mevcut silahın donatma animasyonu
                    this.equipAnim.play();
                    this.active = false; // Donatma sırasında aktif
                    break;
                case WeaponAnimationEventEnum.FIRE:
                    this.fireAnim.weight = 49;
                    this.fireAnim.reset(); // 开火动画
                    this.fireAnim.play();
                    break;
                case WeaponAnimationEventEnum.RELOAD:
                    this.reloadAnim.weight = 49;
                    this.reloadAnim.reset();
                    this.reloadAnim.play();
                    this.active = false; // Yeniden doldurma sırasında silah aktif değil
                    break;
            }
        })
    }

    /** Ateş etme */
    fire(): void {

        if (!startRecover) { // Geri tepme iyileşme durumuna geçtiyse
            cameraRotationBasicTotal = recovercameraRotateTotalX; // Kamera toplam değişimi iyileşme sonrası miktara eşit olur
        }

        const bpX = (1 / this.accurateRange) * (Math.random() - 0.5);
        const bpY = (1 / this.accurateRange) * Math.random(); // Y eksenindeki sapma sadece yukarı doğru olur

        // Kamera pozisyon değişikliği
        const deltaPitch = 0.05 * Math.PI * (1 / this.recoilControl);
        this.camera.rotation.x += deltaPitch;
        cameraRotationBasicTotal += deltaPitch; // Kameranın geri tepme sonucu aldığı değeri kaydet

        // Namludaki hat eklenir, seri atış oldukça isabet azalır
        this.recoverLine += this.fireRate;
        const k = ((this.recoverLine / this.fireRate) - 1.0) * 60 / this.recoilControl;

        const deltaRecoiledX = bpX * k;
        const deltaRecoiledY = bpY * k;
        bPointRecoiledScreenCoord.set(deltaRecoiledX, deltaRecoiledY);

        // Animasyon olayı tetikle
        WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.FIRE;
        WeaponAnimationEvent.detail.weaponInstance = this;
        AnimationEventPipe.dispatchEvent(WeaponAnimationEvent);
        // Ateş etme mantıksal olayı tetikle
        WeaponFireEvent.detail.bPointRecoiledScreenCoord = bPointRecoiledScreenCoord;
        WeaponFireEvent.detail.weaponInstance = this;
        GameLogicEventPipe.dispatchEvent(WeaponFireEvent);

        this.bulletLeftMagzine -= 1;
        startRecover = true;

    };

    recover(deltaTime?: number, elapsedTime?: number): void {
        if (this.recoverLine != 0) { // Nişangahın iyileştirilmesi gerekiyor

            // Eğer iyileşmenin ilk karesi ise
            if (startRecover) {
                recovercameraRotateTotalX = cameraRotationBasicTotal; // recovercameraRotateTotalX'in bu iyileşme sırasında geri dönmesi gereken toplam değeri kaydet
                startRecoverLine = this.recoverLine;
            }

            let deltaRecoverScale = deltaTime / this.recoverTime; // Her deltaTime süresince iyileşme miktarı
            const recoverLineBeforeMinus = this.recoverLine;
            if (this.recoverLine - (deltaRecoverScale * startRecoverLine) > 0) this.recoverLine -= (deltaRecoverScale * startRecoverLine);
            else { // Eğer sonraki karede sıfırın altına inecekse
                deltaRecoverScale = this.recoverLine / startRecoverLine;
                this.recoverLine = 0; // Geri tepme ara yüzü sıfırlandı
                cameraRotationBasicTotal = 0;
                recovercameraRotateTotalX = 0;
            }
            const minusScale = recoverLineBeforeMinus - this.recoverLine;
            const recoverLineScale = minusScale / startRecoverLine;
            const deltaPitch = cameraRotationBasicTotal * recoverLineScale;
            this.camera.rotation.x -= deltaPitch;
            recovercameraRotateTotalX -= deltaPitch;
            startRecover = false; // Bir sonraki kare iyileşmenin ilk karesi değil
            //
        }
    }
}