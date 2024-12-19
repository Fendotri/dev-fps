import { GameContext } from '@src/core/GameContext'

import bulletHoleVertex from '@assets/shaders/bullet/hole/flash.vert?raw';
import bulletHoleFrag from '@assets/shaders/bullet/hole/flash.frag?raw';


import flashTexture from '@assets/textures/bullet.hole.flash.png';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { BulletFallenPointEvent, LayerEventPipe } from '@src/gameplay/pipes/LayerEventPipe';
import { AdditiveBlending, BufferAttribute, BufferGeometry, FrontSide, Points, ShaderMaterial, Texture } from 'three';

const image = new Image();
const texture = new Texture(image);
image.src = flashTexture;
image.onload = () => { texture.needsUpdate = true; }

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);

/**
 * Mermi izlerinin sahnedeki nesnelere çarptığında oluşan ışık efektleri
 */
export class BulletHoleFlashLayer implements CycleInterface, LoopInterface {

    scene: THREE.Scene;

    maximun: number = 10; // Maksimum mermi izi sayısı

    bulletHoleOpacity: number = 1.; // Işık efekti şeffaflığı
    bulletHoleScale: number = 1.5; // Işık efektinin boyutu
    bulletHoleFlashTime: number = .03; // Işık efektinin sürekliliği (flash süresi)

    bulletHoleGeometry: THREE.BufferGeometry = new BufferGeometry();
    bulletHoleMaterial: THREE.ShaderMaterial = new ShaderMaterial({
        uniforms: {
            uTime: { value: 0. },
            uOpacity: { value: this.bulletHoleOpacity },
            uScale: { value: this.bulletHoleScale },
            uFlashTime: { value: this.bulletHoleFlashTime },
            uFlashT: { value: texture }
        },
        depthWrite: false, // Derinlik yazma, bu sayede bu obje diğer objelerin derinlik hesaplamalarına etki etmez
        blending: AdditiveBlending,
        side: FrontSide,
        transparent: true,
        vertexShader: bulletHoleVertex,
        fragmentShader: bulletHoleFrag,
    });

    // geometry.attributes ile bufferlar yeniden kullanılabilir
    positionFoat32Array: Float32Array; // Çarpan üçgenin nokta pozisyonları
    normalFoat32Array: Float32Array; // Çarpan üçgenin normalleri
    generTimeFLoat32Array: Float32Array; // Bu mermi izinin oluşturulma zamanı
    randFoat32Array: Float32Array; // Bu mermi izinin rastgele boyut etkisi

    positionBufferAttribute: THREE.BufferAttribute;
    normalBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    // Sonraki mermi izi pozisyonu

    bulletHoleIndex: number = 0;

    init(): void {

        // Array buffer oluşturuluyor
        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.normalFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        for (let i = 0; i < this.maximun; i++) { // Başlangıçta tüm mermi izleri görünmez, oluşturulma zamanı -10 saniye olarak atanır
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // Mermi izi sprite'ı ekleniyor
        this.scene = GameContext.Scenes.Sprites;
        const bulletHoles = new Points(this.bulletHoleGeometry, this.bulletHoleMaterial);
        bulletHoles.frustumCulled = false; // Her durumda render edilecek
        this.scene.add(bulletHoles);

        // BufferAttribute oluşturuluyor
        this.positionBufferAttribute = new BufferAttribute(this.positionFoat32Array, 3);
        this.normalBufferAttribute = new BufferAttribute(this.normalFoat32Array, 3);
        this.generTimeBufferAttribute = new BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new BufferAttribute(this.randFoat32Array, 1);

        // BufferAttribute atanıyor
        this.bulletHoleGeometry.setAttribute('position', this.positionBufferAttribute);
        this.bulletHoleGeometry.setAttribute('normal', this.normalBufferAttribute);
        this.bulletHoleGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.bulletHoleGeometry.setAttribute('rand', this.randBufferAttribute);

        // Olay hattı dinleniyor
        LayerEventPipe.addEventListener(BulletFallenPointEvent.type, (e: CustomEvent) => { this.addPoint(e.detail.fallenPoint, e.detail.fallenNormal); })
    }

    /** Mermi izi ekleme metodu */
    addPoint(point: THREE.Vector3, normal: THREE.Vector3) {

        const random = 0.5 + Math.random() * .5; // 0.5 ~ 1 arası rastgele bir değer

        // Mermi izi pozisyonu

        this.positionFoat32Array.set(point.toArray(array3Util, 0), this.bulletHoleIndex * 3);

        // Mermi izi normali

        this.normalFoat32Array.set(normal.toArray(array3Util, 0), this.bulletHoleIndex * 3);

        // Mermi izi oluşturulma zamanı

        array1Util[0] = GameContext.GameLoop.Clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.bulletHoleIndex);

        // Mermi izinin rastgele boyut etkisi

        array1Util[0] = random;
        this.randFoat32Array.set(array1Util, this.bulletHoleIndex);

        if (this.bulletHoleIndex + 1 >= this.maximun) this.bulletHoleIndex = 0; // Eğer index +1, maksimum mermi izi sayısını aşarsa, 0'dan başlar
        else this.bulletHoleIndex += 1;

        // BufferAttribute güncelleniyor

        this.positionBufferAttribute.needsUpdate = true;
        this.normalBufferAttribute.needsUpdate = true;
        this.generTimeBufferAttribute.needsUpdate = true;
        this.randBufferAttribute.needsUpdate = true;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.bulletHoleMaterial.uniforms.uTime.value = elapsedTime;

    }

}