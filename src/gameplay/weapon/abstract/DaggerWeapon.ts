import { GameContext } from '@src/core/GameContext';
import { UserInputEventEnum, WeaponAnimationEventEnum } from '@src/gameplay/abstract/EventsEnum';
import { WeaponClassificationEnum } from '@src/gameplay/abstract/WeaponClassificationEnum';
import { AnimationEventPipe, WeaponAnimationEvent } from '@src/gameplay/pipes/AnimationEventPipe';
import { GameLogicEventPipe, WeaponFireEvent } from '@src/gameplay/pipes/GameLogicEventPipe';
import { UserInputEvent, UserInputEventPipe } from '@src/gameplay/pipes/UserinputEventPipe';
import { LoopOnce, LoopRepeat, MathUtils, Vector2 } from 'three';

import { WeaponInterface } from "./WeaponInterface";

const bPointRecoiledScreenCoord: THREE.Vector2 = new Vector2(); // Ateş sonrası geri tepme etkisi sonrası hedef noktası

export class DaggerWeapon implements WeaponInterface {

    private animationMixer: THREE.AnimationMixer; // Animasyon/mesh karıştırıcı
    private weaponSkinnedMesh: THREE.SkinnedMesh; // Silahın mesh modeli
    private scene: THREE.Scene = GameContext.Scenes.Handmodel; // Silahın sahnesi

    active: boolean; // Silah aktif mi?

    weaponClassificationEnum: WeaponClassificationEnum = WeaponClassificationEnum.Malee; // Silah türü
    weaponUUID: string = MathUtils.generateUUID(); // Silah için benzersiz ID
    lastFireTime: number = 0; // Son ateş etme zamanı
    bulletLeftMagzine: number; // Şarjörde kalan mermi
    bulletLeftTotal: number; // Toplam kalan mermi
    weaponName: string; // Silah adı
    weaponNameSuffix: string; // Silah adı eki
    magazineSize: number; // Şarjör kapasitesi
    recoverTime: number; // Toparlanma süresi
    reloadTime: number; // Yeniden yükleme süresi
    speed: number; // Hız
    killaward: number; // Öldürme ödülü
    damage: number; // Hasar değeri
    fireRate: number = 0.5; // Ateş hızı
    recoilControl: number; // Geri tepme kontrolü
    accurateRange: number; // Doğruluk menzili
    armorPenetration: number; // Zırh delme değeri

    constructor() {
        // Kullanıcıdan gelen silah olaylarını dinle
        UserInputEventPipe.addEventListener(UserInputEvent.type, (e: CustomEvent) => {
            if (!this.active) return; // Silah aktif değilse işlem yapma
            switch (e.detail.enum) {
                case UserInputEventEnum.BUTTON_TRIGGLE_DOWN: // Tetik çekildiğinde
                    const performanceNow = performance.now();
                    if (!GameContext.PointLock.isLocked) return; // Nişan kilitli değilse işlem yapma
                    if (!this.active) return; // Silah aktif değilse işlem yapma
                    if (performanceNow - this.lastFireTime < this.fireRate * 1000) return; // Ateş hızı sınırını kontrol et
                    this.lastFireTime = performanceNow;
                    WeaponAnimationEvent.detail.enum = WeaponAnimationEventEnum.FIRE;
                    WeaponAnimationEvent.detail.weaponInstance = this;
                    AnimationEventPipe.dispatchEvent(WeaponAnimationEvent); // Animasyon olayı tetikle
                    WeaponFireEvent.detail.bPointRecoiledScreenCoord = bPointRecoiledScreenCoord;
                    WeaponFireEvent.detail.weaponInstance = this;
                    GameLogicEventPipe.dispatchEvent(WeaponFireEvent); // Oyun mantığı ateş olayını tetikle
                    break;
            }
        })
    }

    // Silah animasyonları
    private equipAnim: THREE.AnimationAction; // Donatma animasyonu
    private fireAnim: THREE.AnimationAction; // Ateş etme animasyonu
    private holdAnim: THREE.AnimationAction; // Tutma animasyonu
    private viewAnim: THREE.AnimationAction; // İnceleme animasyonu

    /** Animasyonları başlat */
    initAnimation() {

        const equipAnimName = `${this.weaponName}_equip`; // Donatma animasyonu adı
        const fireAnimName = `${this.weaponName}_fire`; // Ateş etme animasyonu adı
        const holdAnimName = `${this.weaponName}_hold`; // Tutma animasyonu adı
        const viewAnimName = `${this.weaponName}_view`; // İnceleme animasyonu adı

        this.weaponSkinnedMesh = GameContext.GameResources.resourceMap.get(`${this.weaponName}_1`) as THREE.SkinnedMesh; // Silah mesh modeli
        this.animationMixer = GameContext.GameResources.resourceMap.get('AnimationMixer') as THREE.AnimationMixer; // Animasyon karıştırıcı

        // Mesh modelini sahneye ekle
        this.scene.add(this.weaponSkinnedMesh);
        this.equipAnim = GameContext.GameResources.resourceMap.get(equipAnimName) as THREE.AnimationAction;
        if (this.equipAnim) this.equipAnim.loop = LoopOnce;
        this.fireAnim = GameContext.GameResources.resourceMap.get(fireAnimName) as THREE.AnimationAction;
        if (this.fireAnim) this.fireAnim.loop = LoopOnce;
        this.holdAnim = GameContext.GameResources.resourceMap.get(holdAnimName) as THREE.AnimationAction;
        if (this.holdAnim) this.holdAnim.loop = LoopRepeat; // Tutma animasyonu sürekli oynar
        this.viewAnim = GameContext.GameResources.resourceMap.get(viewAnimName) as THREE.AnimationAction;
        if (this.viewAnim) this.viewAnim.loop = LoopOnce;

        // Bazı animasyonlar bittiğinde parametreleri güncelle
        this.animationMixer.addEventListener('finished', (e: any) => {
            if (e.type === 'finished') {
                switch (e.action._clip.name) {
                    case equipAnimName: // Donatma animasyonu bittiğinde
                        this.active = true; // Silahı aktif et
                        break;
                }
            }
        })

        // Silah olaylarını dinle ve animasyonları kontrol et
        AnimationEventPipe.addEventListener(WeaponAnimationEvent.type, (e: CustomEvent) => {
            if (e.detail.weaponInstance !== this) return; // Sadece bu silahın olaylarını işleme al
            switch (e.detail.enum) {
                case WeaponAnimationEventEnum.RELIEVE_EQUIP:  // Donatma kaldırma
                    this.weaponSkinnedMesh.visible = false; // Silahı görünmez yap
                    this.active = false; // Silahı pasif yap
                    this.animationMixer.stopAllAction(); // Tüm animasyonları durdur
                    if (this.holdAnim) this.holdAnim.reset();
                    if (this.equipAnim) this.equipAnim.reset();
                    if (this.fireAnim) this.fireAnim.reset();
                    if (this.viewAnim) this.viewAnim.reset();
                    break;
                case WeaponAnimationEventEnum.EQUIP:  // Donatma
                    this.weaponSkinnedMesh.visible = true; // Silahı görünür yap
                    this.holdAnim.play();
                    this.equipAnim.weight = 49;
                    this.equipAnim.reset(); // Donatma animasyonunu başlat
                    this.equipAnim.play();
                    this.active = false; // Donatma sırasında silah pasif olur
                    break;
                case WeaponAnimationEventEnum.FIRE:
                    this.fireAnim.weight = 49;
                    this.fireAnim.reset(); // Ateş etme animasyonunu başlat
                    this.fireAnim.play();
                    break;
            }
        })
    }

}