import { GameContext } from '@src/core/GameContext';
import { GameObjectMaterialEnum } from '../abstract/GameObjectMaterialEnum';
import { WeaponClassificationEnum } from '../abstract/WeaponClassificationEnum';
import { BulletFallenPointEvent, LayerEventPipe, ShotOutWeaponFireEvent } from '../pipes/LayerEventPipe';
import { UserInputEvent, UserInputEventPipe } from '../pipes/UserinputEventPipe';
import { UserInputEventEnum } from '@src/gameplay/abstract/EventsEnum';
import { GameLogicEventPipe, WeaponFireEvent } from '../pipes/GameLogicEventPipe';
import { Raycaster } from 'three';

/** 
 * Silah Sistemi, silah ile ilgili dışa aktarılan olayları işler:
 * 1. Olaylar aracılığıyla ateşleme sonrası geri tepme ile hesaplanan merminin ekran koordinatını alır;
 *    Kamera pozisyonunu alır, kameradan lazeri ayarlar ve mermi düşüş noktası lazerinin son noktasını hesaplar.
 * 2. Çarpan nesnenin oyun içi malzemesini kontrol eder; farklı nesneler için farklı mantık malzemeleri ve olayları kullanır.
 * 3. Etkileşimli efekt render olaylarını işler.
 * 4. Fare butonu durumunu kaydeder.
 */
export class WeaponSystem {

    camera: THREE.Camera = GameContext.Cameras.PlayerCamera; // Silah sistemi etkileşiminde kullanılan kamera
    scene: THREE.Scene = GameContext.Scenes.Level; // Silah sistemi etkileşimde olduğu sahne
    triggleDown: boolean = false;  // Geçerli tetikleyici durumu
    raycaster = new Raycaster(); // Lazer tespiti için kullanılan raycaster
    _objectsIntersectedArray: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];  // Lazer tespiti sonuçlarını saklamak için kullanılan dizi

    // Singleton modeli
    private static weaponSystemInstance: WeaponSystem;
    private constructor() {
        UserInputEventPipe.addEventListener(UserInputEvent.type, (e: CustomEvent) => { // Kullanıcı girdi olaylarına tepki verir
            switch (e.detail.enum) {
                case UserInputEventEnum.BUTTON_TRIGGLE_DOWN: // Tetikleme başlatma olayı
                    this.triggleDown = true;
                    break;
                case UserInputEventEnum.BUTTON_TRIGGLE_UP: // Tetikleme durdurma olayı
                    this.triggleDown = false;
                    break;
            }
        })
        this.dealWithWeaponOpenFire();
    }
    public static getInstance() {
        if (!this.weaponSystemInstance) this.weaponSystemInstance = new WeaponSystem();
        return this.weaponSystemInstance;
    }

    /** 
     * Silah ateşleme olayını işler
     */
    dealWithWeaponOpenFire() {
        GameLogicEventPipe.addEventListener(WeaponFireEvent.type, (e: CustomEvent) => {
            // 1. Render katmanına ateşleme etkisi render olayı gönderir
            if (e.detail.weaponInstance &&
                e.detail.weaponInstance.weaponClassificationEnum !== WeaponClassificationEnum.Malee)
                LayerEventPipe.dispatchEvent(ShotOutWeaponFireEvent); // Render katmanına ateşleme efekti gönderir

            // 2. Lazer çarpma tespiti yapılır
            this._objectsIntersectedArray.length = 0; // Dizi temizlenir
            let ifGenerated = false; // Zaten mermi düşüşü üretilmiş mi kontrol edilir
            const bpPointScreenCoord = e.detail.bPointRecoiledScreenCoord; // Geri tepme etkisi sonrası merminin ekran koordinatındaki noktası
            this.raycaster.setFromCamera(bpPointScreenCoord, this.camera); // Kameraya göre lazer yönlendirilir
            this.raycaster.params.Mesh.threshold = 1; // threshold, çarpan nesnelerin hassasiyetidir
            this.raycaster.intersectObjects(this.scene.children, true, this._objectsIntersectedArray); // Çarpan nesneleri tespit eder

            // 3. Mermi düşüşü efekti render edilir
            if (this._objectsIntersectedArray.length > 0) { // Eğer çarpan bir yüzey varsa
                for (let i = 0; i < this._objectsIntersectedArray.length; i++) { // Tüm çarpan bilgileri taranır
                    if (ifGenerated) return; // Eğer zaten mermi düşüşü oluşturulmuşsa, işlem durdurulur
                    const point = this._objectsIntersectedArray[i].point; // Mermi düşüşü noktası
                    const gameObjectMaterial = this._objectsIntersectedArray[i].object.userData['GameObjectMaterialEnum'] // Çarpan yüzeyin oyun içi materyali
                    if (gameObjectMaterial === undefined) return; // Eğer materyal oyun içi materyal değilse, işlem durdurulur
                    switch (gameObjectMaterial) {
                        case GameObjectMaterialEnum.PlayerHead | GameObjectMaterialEnum.PlayerBelly | GameObjectMaterialEnum.PlayerChest | GameObjectMaterialEnum.PlayerUpperLimb | GameObjectMaterialEnum.PlayerLowerLimb: // 如果是玩家身体的一部分
                            ifGenerated = true; // Mermi düşüşü oluşturulmaz ve sonrasındaki çarpma işlemleri engellenir
                            // ... Burada oyuncunun vurulduğu olay gönderilebilir
                            break;
                        case GameObjectMaterialEnum.GrassGround: // Eğer sahne nesnesine çarptıysa
                            if (e.detail.weaponInstance &&
                                e.detail.weaponInstance.weaponClassificationEnum === WeaponClassificationEnum.Malee) break; // Eğer silah türü bıçaksa, mermi düşüşü oluşturulmaz

                            // Genel bir fonksiyonla mermi düşüşü eklenir
                            const normal = this._objectsIntersectedArray[i].face.normal;

                            // Render edilen mermi sahneye çarptığında: toprak, duman, kıvılcım efektleri
                            BulletFallenPointEvent.detail.fallenPoint.copy(point);
                            BulletFallenPointEvent.detail.fallenNormal.copy(normal);
                            BulletFallenPointEvent.detail.cameraPosition.copy(this.camera.position);
                            BulletFallenPointEvent.detail.recoiledScreenCoord.copy(bpPointScreenCoord);
                            LayerEventPipe.dispatchEvent(BulletFallenPointEvent);

                            ifGenerated = true; // Sonrasındaki çarpma işlemleri engellenir
                            break;
                    }
                }
            }
        })

    }

}