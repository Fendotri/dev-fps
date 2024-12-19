import bulletShellVert from '@assets/shaders/bullet/shell/bulletshell.vert?raw';
import bulletShellFrag from '@assets/shaders/bullet/shell/bulletshell.frag?raw';

import bulletshellTexture from '@assets/textures/bullet.shell.png';
import { GameContext } from '@src/core/GameContext';
import { CycleInterface } from '../../core/inferface/CycleInterface';
import { LoopInterface } from '../../core/inferface/LoopInterface';
import { GameLogicEventPipe, WeaponEquipEvent } from '../../gameplay/pipes/GameLogicEventPipe';
import { LayerEventPipe, ShotOutWeaponFireEvent } from '../../gameplay/pipes/LayerEventPipe';
import { BufferAttribute, BufferGeometry, CustomBlending, Points, ShaderMaterial, Texture, Vector3 } from 'three';

// Materyal

const image = new Image();
const texture = new Texture(image);
image.src = bulletshellTexture;
image.onload = () => { texture.needsUpdate = true; }

// Araç değişkenleri

const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);
const chamberPositionUtil = new Vector3(); // Fırlatılan mermi kovanının konumu

/**
 * Silah ateşlendiğinde mermi kovanlarının fırlaması, yere düşmesi ve zıplaması
 * Gerekli parametreler: oyuncu konumu, mevcut mermi kovanının konumu
 */
export class ChamberBulletShell implements CycleInterface, LoopInterface {

    scene: THREE.Scene;
    camera: THREE.Camera;

    ifRender: boolean = false; // Bu katmanı render edip etmeyeceğimiz durumu

    maximun: number = 10; // Maksimum mermi kovanı sayısı

    bulletShellOpacity: number = 1.; // Mermi kovanının opaklığı
    bulletShellScale: number = 1.2; // Mermi kovanı boyutu
    bulletShellDisappearTime: number = .4; // Mermi kovanının görünürlük süresi (saniye)

    bulletShellsGeometry = new BufferGeometry();
    bulletShellsMaterial = new ShaderMaterial({
        uniforms: {
            uTime: { value: -20 },
            uDisapperTime: { value: this.bulletShellDisappearTime },
            uScale: { value: this.bulletShellScale },
            uOpacity: { value: this.bulletShellOpacity },
            uBulletShellT: { value: texture },
        },
        blending: CustomBlending,
        vertexShader: bulletShellVert,
        fragmentShader: bulletShellFrag,
        // depthTest: THREE.NeverDepth, // Derinlik testi kapalı, sadece yerel sahnede render yapılacak
    });

    positionFoat32Array: Float32Array; // Mermi kovanı yerleri
    generTimeFLoat32Array: Float32Array; // Mermi kovanı oluşturulma zamanı
    randFoat32Array: Float32Array; // Rastgele tohumlar

    positionBufferAttribute: THREE.BufferAttribute;
    generTimeBufferAttribute: THREE.BufferAttribute;
    randBufferAttribute: THREE.BufferAttribute;

    bulletShellIndex: number = 0;

    init(): void {

        // Sahne ve kamera referanslarını al
        this.scene = GameContext.Scenes.Handmodel;
        this.camera = GameContext.Cameras.HandModelCamera;

        // Mermi kovanı sprite'larını ekle
        const bulletShells = new Points(this.bulletShellsGeometry, this.bulletShellsMaterial);
        bulletShells.frustumCulled = false; // Render edilmeye devam edilecek
        this.scene.add(bulletShells);

        // Buffers'ı başlat
        this.initBuffers();

        // Silah ekipmanının mermi kovanı pozisyonunu dinle
        GameLogicEventPipe.addEventListener(WeaponEquipEvent.type, (e: CustomEvent) => {
            const _weaponInstance = WeaponEquipEvent.detail.weaponInstance;
            if (_weaponInstance && _weaponInstance.chamberPosition) {
                this.ifRender = true;
                chamberPositionUtil.copy(_weaponInstance.chamberPosition);
            } else this.ifRender = false;

        })

        // Ateş etme olayını dinle
        LayerEventPipe.addEventListener(ShotOutWeaponFireEvent.type, (e: CustomEvent) => {
            if (this.ifRender) this.render();
        });
    }

    /**
     * Buffers'ı başlat
     */
    initBuffers() {

        // Dizi buffer'larını oluştur

        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3 * this.maximun));
        this.generTimeFLoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));
        this.randFoat32Array = new Float32Array(new ArrayBuffer(4 * this.maximun));

        for (let i = 0; i < this.maximun; i++) { // Başlangıçta, tüm mermi kovanları gizli, bu yüzden onlara -10 saniyelik bir oluşturulma zamanı veriyoruz
            array1Util[0] = -10;
            this.generTimeFLoat32Array.set(array1Util, i);
        }

        // BufferAttribute oluştur

        this.positionBufferAttribute = new BufferAttribute(this.positionFoat32Array, 3);
        this.generTimeBufferAttribute = new BufferAttribute(this.generTimeFLoat32Array, 1);
        this.randBufferAttribute = new BufferAttribute(this.randFoat32Array, 1);

        // BufferAttribute'leri ayarla

        this.bulletShellsGeometry.setAttribute('position', this.positionBufferAttribute);
        this.bulletShellsGeometry.setAttribute('generTime', this.generTimeBufferAttribute);
        this.bulletShellsGeometry.setAttribute('rand', this.randBufferAttribute);

    }

    /** 
     * Mermi kovanı ekle
     */
    render() {

        // Mermi kovanı pozisyonunu ayarla

        this.positionFoat32Array.set(chamberPositionUtil.toArray(array3Util, 0), this.bulletShellIndex * 3);
        this.positionBufferAttribute.needsUpdate = true;

        // Mermi kovanının oluşturulma zamanını ayarla

        array1Util[0] = GameContext.GameLoop.Clock.getElapsedTime();
        this.generTimeFLoat32Array.set(array1Util, this.bulletShellIndex);
        this.generTimeBufferAttribute.needsUpdate = true;

        // Rastgele bir tohum oluştur

        const random = Math.random();
        array1Util[0] = random;
        this.randFoat32Array.set(array1Util, this.bulletShellIndex);
        this.randBufferAttribute.needsUpdate = true;

        // Index'i güncelle

        if (this.bulletShellIndex + 1 >= this.maximun) this.bulletShellIndex = 0; // Eğer index + 1, belirlenen maksimum kovan sayısını aşarsa, sıfırdan başla
        else this.bulletShellIndex += 1;

    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {

        this.bulletShellsMaterial.uniforms.uTime.value = elapsedTime; // Zamanı güncelle

    }

}