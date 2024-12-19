import { GameContext } from '@src/core/GameContext'
import bulletHoleVertex from '@assets/shaders/bullet/hole/point.vert?raw';
import bulletHoleFrag from '@assets/shaders/bullet/hole/point.frag?raw';
import pointTexture from '@assets/textures/bullet.hole.point.png';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { BulletFallenPointEvent, LayerEventPipe } from '@src/gameplay/pipes/LayerEventPipe';
import { BufferAttribute, BufferGeometry, CustomBlending, Points, ShaderMaterial, Texture } from 'three';

const image = new Image();
const texture = new Texture(image);
image.src = pointTexture;
image.onload = () => { texture.needsUpdate = true; }

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);

/**
 * Mermi deliği (bullet hole) efekti render'ı
 */
export class BulletHoleLayer implements CycleInterface, LoopInterface {

    scene: THREE.Scene;

    maximun: number = 40; // Maksimum mermi deliği sayısı

    bulletHoleOpacity: number = .8; // Mermi deliği şeffaflığı
    bulletHoleScale: number = 1.5; // Mermi deliği boyutu
    exitTime: number = 5; // Mermi deliğinin varlık süresi (kaç saniye sonra kaybolmaya başlar)
    fadeTime: number = .5; // Mermi deliği kaybolma geçiş süresi

    bulletHoleGeometry: THREE.BufferGeometry = new BufferGeometry();
    bulletHoleMaterial: THREE.ShaderMaterial = new ShaderMaterial({
        uniforms: {
            uTime: { value: 0. },
            uOpacity: { value: this.bulletHoleOpacity },
            uScale: { value: this.bulletHoleScale },
            uExitTime: { value: this.exitTime },
            uFadeTime: { value: this.fadeTime },
            uBulletHoleT: { value: texture },
        },
        blending: CustomBlending,
        depthWrite: false, // Derinlik testi yapılırken etkilenmemesi için
        transparent: true,
        vertexShader: bulletHoleVertex,
        fragmentShader: bulletHoleFrag,
    });

    // Geometriye ait veri tamponları (buffer attributes)
    positionFoat32Array: Float32Array; // Vurulan yüzeydeki nokta konumları
    normalFoat32Array: Float32Array; // Vurulan yüzeyin normali
    generTimeFLoat32Array: Float32Array; // Bu mermi deliğinin oluşturulma zamanı
    randFoat32Array: Float32Array; // Mermi deliğinin rastgele boyut etkisi

    positionBufferAttribute: THREE.BufferAttribute;
    normalBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    // Bir sonraki mermi deliği için pozisyon göstergesi

    bulletHoleIndex: number = 0;

    init(): void {

        // Başlangıç ayarları
        this.scene = GameContext.Scenes.Sprites;

        // Float32Array tamponlarını oluştur
        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.normalFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        for (let i = 0; i < this.maximun; i++) { // Başlangıçta tüm mermi delikleri gizli, bu yüzden oluşturulma zamanı -10 saniye olarak ayarlanır
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // BufferAttribute'leri oluştur
        this.positionBufferAttribute = new BufferAttribute(this.positionFoat32Array, 3);
        this.normalBufferAttribute = new BufferAttribute(this.normalFoat32Array, 3);
        this.generTimeBufferAttribute = new BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new BufferAttribute(this.randFoat32Array, 1);

        // BufferAttribute'leri geometriye ekle
        this.bulletHoleGeometry.setAttribute('position', this.positionBufferAttribute);
        this.bulletHoleGeometry.setAttribute('normal', this.normalBufferAttribute);
        this.bulletHoleGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.bulletHoleGeometry.setAttribute('rand', this.randBufferAttribute);

        // Mermi deliklerini ekle
        const bulletHoles = new Points(this.bulletHoleGeometry, this.bulletHoleMaterial);
        bulletHoles.frustumCulled = false; // Her durumda render edilmesi için
        this.scene.add(bulletHoles);

        // Mermi düşme olaylarını dinle
        LayerEventPipe.addEventListener(BulletFallenPointEvent.type, (e: CustomEvent) => { this.addPoint(e.detail.fallenPoint, e.detail.fallenNormal); });
    }

    /** Mermi deliği eklemek için kullanılan genel metot */
    addPoint(point: THREE.Vector3, normal: THREE.Vector3) {
        const random = 0.5 + Math.random() * .5; // 0.5 ile 1 arasında rastgele bir değer

        // Mermi deliği pozisyonu
        this.positionFoat32Array.set(point.toArray(array3Util, 0), this.bulletHoleIndex * 3);
        this.positionBufferAttribute.needsUpdate = true;

        // Mermi deliği normali
        this.normalFoat32Array.set(normal.toArray(array3Util, 0), this.bulletHoleIndex * 3);
        this.normalBufferAttribute.needsUpdate = true;

        // Mermi deliği oluşturulma zamanı
        array1Util[0] = GameContext.GameLoop.Clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.bulletHoleIndex);
        this.generTimeBufferAttribute.needsUpdate = true;

        // Mermi deliği rastgele boyut etkisi
        array1Util[0] = random;
        this.randFoat32Array.set(array1Util, this.bulletHoleIndex);
        this.randBufferAttribute.needsUpdate = true;

        // Mermi deliği index'ini güncelle
        if (this.bulletHoleIndex + 1 >= this.maximun) this.bulletHoleIndex = 0; // Eğer index son limitin üstüne çıkarsa, sıfırdan başla
        else this.bulletHoleIndex += 1;
    }

    // Her karede yapılacak işlemler
    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        this.bulletHoleMaterial.uniforms.uTime.value = elapsedTime;
    }

}