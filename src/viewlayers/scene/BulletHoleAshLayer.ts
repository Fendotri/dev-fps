import bulletHoleAshVertex from '@assets/shaders/bullet/hole/ash.vert?raw';
import bulletHoleAshFrag from '@assets/shaders/bullet/hole/ash.frag?raw';

import ashTexture from '@assets/textures/bullet.hole.ash.png';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { GameContext } from '@src/core/GameContext';
import { BulletFallenPointEvent, LayerEventPipe } from '@src/gameplay/pipes/LayerEventPipe';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Texture } from 'three';

const image = new Image();
const texture = new Texture(image);
image.src = ashTexture;
image.onload = () => { texture.needsUpdate = true; }

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);

/**
 * Bu sınıf, mermiyle sahneye çarpan ve toz efektleri yaratan bir sistemi temsil eder.
 */
export class BulletHoleAshLayer implements CycleInterface, LoopInterface {

    scene: THREE.Scene;

    maximun: number = 10; // Maksimum sayıda mermi deliği oluşturulabilir

    bulletHoleOpacity: number = .4; // Mermi deliği opaklığı
    bulletHoleScale: number = 15.; // Mermi deliği boyutu
    exitTime: number = .1; // Mermi deliğinin varlık süresi (kaç saniye sonra kaybolmaya başlar)
    fadeTime: number = .1; // Mermi deliğinin kaybolma süresi (gradyanla kaybolma süresi)

    bulletHoleGeometry: THREE.BufferGeometry = new BufferGeometry();
    bulletHoleMaterial: THREE.ShaderMaterial = new ShaderMaterial({
        uniforms: {
            uTime: { value: 0. },
            uOpacity: { value: this.bulletHoleOpacity },
            uScale: { value: this.bulletHoleScale },
            uExitTime: { value: this.exitTime },
            uFadeTime: { value: this.fadeTime },
            uAshT: { value: texture },
        },
        blending: AdditiveBlending,
        transparent: true,
        vertexShader: bulletHoleAshVertex,
        fragmentShader: bulletHoleAshFrag,
    });

    // Mermi delikleri için kullanılan verileri tutacak arrayler
    positionFoat32Array: Float32Array; // Merminin çarptığı üçgen yüzeyin koordinatları
    normalFoat32Array: Float32Array; // Yüzeyin normali
    generTimeFLoat32Array: Float32Array; // Mermi deliğinin oluşturulma zamanı
    randFoat32Array: Float32Array; // Mermi deliğinin rastgele boyutu

    positionBufferAttribute: THREE.BufferAttribute;
    normalBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    // Bir sonraki mermi deliği için yer indeksini takip eden işaretçi
    bulletHoleIndex: number = 0;

    init(): void {

        // Sahneyi ve materyali başlatma
        this.scene = GameContext.Scenes.Sprites;
        this.bulletHoleMaterial.depthWrite = false; // Derinlik testi yapılırken kendisinin etkilenmemesini sağlar

        // Dizi bellek tamponu oluşturma
        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.normalFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));

        // Başlangıçta tüm mermi delikleri gösterilmez, her birinin oluşturulma zamanı -10 saniye olarak ayarlanır
        for (let i = 0; i < this.maximun; i++) { // 默认初始化时所有弹点都不显示, 给他们赋予生成时间为-10s
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // Mermi delikleri eklenir
        const bulletHoles = new Points(this.bulletHoleGeometry, this.bulletHoleMaterial);
        bulletHoles.frustumCulled = false; // Ne olursa olsun render edilir
        this.scene.add(bulletHoles);

        // BufferAttribute'leri oluşturma
        this.positionBufferAttribute = new BufferAttribute(this.positionFoat32Array, 3);
        this.normalBufferAttribute = new BufferAttribute(this.normalFoat32Array, 3);
        this.generTimeBufferAttribute = new BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new BufferAttribute(this.randFoat32Array, 1);

        // BufferAttribute'leri materyale bağlama
        this.bulletHoleGeometry.setAttribute('position', this.positionBufferAttribute);
        this.bulletHoleGeometry.setAttribute('normal', this.normalBufferAttribute);
        this.bulletHoleGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.bulletHoleGeometry.setAttribute('rand', this.randBufferAttribute);

        // Mermi delikleri oluşturulduğunda tetiklenen olayları dinleme
        LayerEventPipe.addEventListener(BulletFallenPointEvent.type, (e: CustomEvent) => { this.addPoint(e.detail.fallenPoint, e.detail.fallenNormal); })

    }

    /** 
     * Mermi deliği eklemek için genel bir yöntem
     */
    addPoint(point: THREE.Vector3, normal: THREE.Vector3) {

        const random = 0.5 + Math.random() * .5; // 0.5 ile 1 arasında rastgele bir boyut

        // Mermi deliği pozisyonu

        this.positionFoat32Array.set(point.toArray(array3Util, 0), this.bulletHoleIndex * 3);

        // Mermi deliği normali

        this.normalFoat32Array.set(normal.toArray(array3Util, 0), this.bulletHoleIndex * 3);

        // Mermi deliğinin oluşturulma zamanı

        array1Util[0] = GameContext.GameLoop.Clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.bulletHoleIndex);

        // Mermi deliği rastgele boyutu

        array1Util[0] = random;
        this.randFoat32Array.set(array1Util, this.bulletHoleIndex);

        // Eğer maksimum sayıya ulaşıldıysa, sıfırlanır
        if (this.bulletHoleIndex + 1 >= this.maximun) this.bulletHoleIndex = 0; 
        else this.bulletHoleIndex += 1;

        // BufferAttribute'leri güncelleme
        this.positionBufferAttribute.needsUpdate = true;
        this.normalBufferAttribute.needsUpdate = true;
        this.generTimeBufferAttribute.needsUpdate = true;
        this.randBufferAttribute.needsUpdate = true;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        // Shader materyali için zaman bilgisini güncelleme
        this.bulletHoleMaterial.uniforms.uTime.value = elapsedTime;

    }

}