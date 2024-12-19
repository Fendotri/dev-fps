

import { GameContext } from '@src/core/GameContext'

import chamberSmokeVert from '@assets/shaders/chamber/smoke.vert?raw'
import chamberSmokeFrag from '@assets/shaders/chamber/smoke.frag?raw'


import smokeTexture from '@assets/textures/smoke.png';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { WeaponComponentsPositionUtil } from '@src/core/lib/WeaponComponentsPositionUtil';
import { GameLogicEventPipe, WeaponEquipEvent } from '@src/gameplay/pipes/GameLogicEventPipe';
import { LayerEventPipe, ShotOutWeaponFireEvent } from '@src/gameplay/pipes/LayerEventPipe';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Camera, Points, Scene, ShaderMaterial, Texture } from 'three';

const image = new Image();
const texture = new Texture(image);
image.src = smokeTexture;
image.onload = () => { texture.needsUpdate = true; }

// Yardımcı değişkenler

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);
/**
 * Silahın ateş etme sırasında oluşan duman etkisi
 */
export class ChamberSmokeLayer implements CycleInterface, LoopInterface {

    ifRender: boolean = false;

    scene: Scene;
    camera: Camera;
    handModelCamera: Camera;

    maximun: number = 20 * 2; // Maksimum duman noktası sayısı

    weaponComponentsPositionUtil: WeaponComponentsPositionUtil;

    chamberSmokeOpacityFactor: number = .1; // Dumanın opaklık faktörü
    chamberSmokeDisapperTime: number = 1.; // Dumanın kaybolma süresi
    chamberSmokeFadeTime: number = 1.5; // Dumanın kaybolma geçiş süresi
    chamberSmokeScale: number = 1.5; // Dumanın boyutu
    chamberSmokeSpeed: number = .2; // Dumanın hareket hızı
    chamberSmokeDisappearTime: number = .4; // Dumanın varlık süresi (kaç saniye sonra kaybolmaya başlar)

    chamberSmokeGeometry: BufferGeometry = new BufferGeometry();
    chamberSmokeSM: ShaderMaterial = new ShaderMaterial({
        transparent: true,
        blending: AdditiveBlending,
        uniforms: {
            uTime: { value: 0. },
            uSmokeT: { value: texture },
            uOpacityFactor: { value: this.chamberSmokeOpacityFactor },
            uDisappearTime: { value: this.chamberSmokeDisapperTime },
            uSpeed: { value: this.chamberSmokeSpeed },
            uFadeTime: { value: this.chamberSmokeFadeTime },
            uScale: { value: this.chamberSmokeScale },
            uDisapperTime: { value: this.chamberSmokeDisappearTime },
        },
        depthWrite: false, // Derinlik yazımı kapalı çünkü dumanın diğer nesneleri etkilemesini istemiyoruz
        vertexShader: chamberSmokeVert,
        fragmentShader: chamberSmokeFrag,
    });

    positionFoat32Array: Float32Array; // Dumanın üçgen yüzeydeki konumları
    directionFloat32Array: Float32Array; // Dumanın hareket yönü
    generTimeFLoat32Array: Float32Array; // Dumanın oluşturulma zamanı
    randFoat32Array: Float32Array; // Rastgele sayılar (tuhaf davranışlar için)

    positionBufferAttribute: BufferAttribute;
    directionBufferAttribute: BufferAttribute;
    generTimeBufferAttribute: BufferAttribute;
    randBufferAttribute: BufferAttribute;

    chamberSmokeIndex: number = 0;

    init(): void {

        this.scene = GameContext.Scenes.Sprites;
        this.camera = GameContext.Cameras.PlayerCamera
        this.handModelCamera = GameContext.Cameras.HandModelCamera;

        // Duman partiküllerini sahneye ekleyelim

        const chamberSmokes = new Points(this.chamberSmokeGeometry, this.chamberSmokeSM);
        chamberSmokes.frustumCulled = false; // Her durumda render edilsin
        this.scene.add(chamberSmokes);

        // Buffers'ı başlatma

        this.initBuffers();

        // Silahın mevcut pozisyonunu takip et

        this.listenChamberPosition();

        // Ateş etme olayını dinle
        LayerEventPipe.addEventListener(ShotOutWeaponFireEvent.type, (e: CustomEvent) => {
            if (this.ifRender) this.render();
        });

    }

    initBuffers() {

        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.directionFloat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));

        for (let i = 0; i < this.maximun; i++) { // Başlangıçta, duman noktalarının hiçbiri görünmesin
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // BufferAttribute oluşturuluyor

        this.positionBufferAttribute = new BufferAttribute(this.positionFoat32Array, 3);
        this.directionBufferAttribute = new BufferAttribute(this.directionFloat32Array, 3);
        this.generTimeBufferAttribute = new BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new BufferAttribute(this.randFoat32Array, 1);

        // BufferAttribute'leri belirleyelim

        this.chamberSmokeGeometry.setAttribute('position', this.positionBufferAttribute);
        this.chamberSmokeGeometry.setAttribute('direction', this.directionBufferAttribute);
        this.chamberSmokeGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.chamberSmokeGeometry.setAttribute('rand', this.randBufferAttribute);

    }

    /**
   * Mevcut silahın namlu pozisyonunu güncelle: Yalnızca namlu pozisyonu tanımlanan silahlar bu katman efektiyle render edilecektir
   */
    listenChamberPosition() {
        this.weaponComponentsPositionUtil = WeaponComponentsPositionUtil.getInstance();
        GameLogicEventPipe.addEventListener(WeaponEquipEvent.type, (e: CustomEvent) => {
            const _weaponInstance = WeaponEquipEvent.detail.weaponInstance;
            if (_weaponInstance && _weaponInstance.chamberPosition) this.ifRender = true;
            else this.ifRender = false;
        });
    }

    render() {

        // Konumları güncelleme

        this.positionFoat32Array.set(
            this.weaponComponentsPositionUtil.calculateChamberPosition().toArray(array3Util, 0),
            this.chamberSmokeIndex * 3
        );
        this.positionBufferAttribute.needsUpdate = true;

        // Yönleri güncelleme

        const rightDirection = this.weaponComponentsPositionUtil.rightDirection; // Duman sağa doğru hareket eder
        this.directionFloat32Array.set(
            rightDirection.toArray(array3Util, 0),
            this.chamberSmokeIndex * 3
        );
        this.directionBufferAttribute.needsUpdate = true;

        // Zamanları güncelleme

        array1Util[0] = GameContext.GameLoop.Clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.chamberSmokeIndex * 1);
        this.generTimeBufferAttribute.needsUpdate = true;

        // Rastgele sayılar

        array1Util[0] = Math.random();
        this.randFoat32Array.set(array1Util, this.chamberSmokeIndex * 1);
        this.randBufferAttribute.needsUpdate = true;

        if (this.chamberSmokeIndex + 1 >= this.maximun) this.chamberSmokeIndex = 0; // Eğer index  maksimum limitin üzerine çıkarsa, 0'dan başla
        else this.chamberSmokeIndex += 1;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.chamberSmokeSM.uniforms.uTime.value = elapsedTime;

    }

}