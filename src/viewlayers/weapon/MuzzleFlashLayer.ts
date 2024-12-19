import { AdditiveBlending, BufferAttribute, BufferGeometry, Camera, Points, Scene, ShaderMaterial, Texture, Vector3 } from 'three';
import muzzlesflashVert from '@assets/shaders/muzzle/flash.vert?raw'
import muzzlesflashFrag from '@assets/shaders/muzzle/flash.frag?raw'

import { GameContext } from '@src/core/GameContext'

import flashTexture from '@assets/textures/muzzle.flash.png';
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { LoopInterface } from '@src/core/inferface/LoopInterface';
import { GameLogicEventPipe, WeaponEquipEvent } from '@src/gameplay/pipes/GameLogicEventPipe';
import { LayerEventPipe, ShotOutWeaponFireEvent } from '../../gameplay/pipes/LayerEventPipe';

const image = new Image();
const texture = new Texture(image);
image.src = flashTexture;
image.onload = () => { texture.needsUpdate = true; }

const muzzlePositionUtil = new Vector3(); // Namlu konumu
const array3Util: Array<number> = new Array<number>(3);
const array1Util: Array<number> = new Array<number>(1);

/**
 * Namlu Alevi Efekti
 */
export class MuzzleFlashLayer implements CycleInterface, LoopInterface {

    ifRender: boolean = false; // Efektin render edilip edilmeyeceğini belirler

    scene: Scene; // Sahne
    camera: Camera; // Kamera

    muzzleFlashSize: number = 1.5; // Alevin boyutu
    muzzleFlashTime: number = .01; // Alevin süresi

    muzzleFlashGeometry: BufferGeometry = new BufferGeometry();
    muzzleFlashSM: ShaderMaterial = new ShaderMaterial({
        uniforms: {
            uScale: { value: this.muzzleFlashSize }, // Boyut
            uTime: { value: -1. }, // Zaman
            uFireTime: { value: -1. }, // Ateşleme zamanı
            uOpenFireT: { value: texture }, // Alev dokusu
            uFlashTime: { value: this.muzzleFlashTime }, // Alev süresi
        },
        vertexShader: muzzlesflashVert,
        fragmentShader: muzzlesflashFrag,
        blending: AdditiveBlending, // Ekleme karışım modu
    });

    positionFoat32Array: Float32Array; // Pozisyon verileri
    positionBufferAttribute: BufferAttribute;
    randFloat32Array: Float32Array; // Rastgele değerler
    randBufferAttribute: BufferAttribute;

    init(): void {

        // Sahne ve kamera tanımlamaları
        this.scene = GameContext.Scenes.Handmodel;
        this.camera = GameContext.Cameras.PlayerCamera;

        // Alev objesini sahneye ekle
        const muzzleFlash = new Points(this.muzzleFlashGeometry, this.muzzleFlashSM);
        muzzleFlash.frustumCulled = false; // Her zaman render edilsin
        this.scene.add(muzzleFlash);

        // Buffer'ları başlat
        this.initBuffers();

        // Silahın namlu pozisyonunu dinle
        GameLogicEventPipe.addEventListener(WeaponEquipEvent.type, (e: CustomEvent) => {
            const _weaponInstance = WeaponEquipEvent.detail.weaponInstance;
            if (WeaponEquipEvent.detail.weaponInstance && WeaponEquipEvent.detail.weaponInstance.muzzlePosition) {
                muzzlePositionUtil.copy(_weaponInstance.muzzlePosition); // Namlu pozisyonunu kopyala
                this.ifRender = true;
            }
            else this.ifRender = false; // Namlu pozisyonu yoksa efekt render edilmesin
        })

        // Ateşleme olayını dinle
        LayerEventPipe.addEventListener(ShotOutWeaponFireEvent.type, (e: CustomEvent) => {
            if (this.ifRender) this.render(); // Efekti render et
        });
    }

    initBuffers(): void {

        this.positionFoat32Array = new Float32Array(new ArrayBuffer(4 * 3)); // Pozisyon için buffer
        this.randFloat32Array = new Float32Array(new ArrayBuffer(4 * 1)); // Rastgele değerler için buffer
        this.positionBufferAttribute = new BufferAttribute(this.positionFoat32Array, 3);
        this.randBufferAttribute = new BufferAttribute(this.randFloat32Array, 1);

        // Geometriyi oluştur
        this.muzzleFlashGeometry.setAttribute('position', this.positionBufferAttribute);
        this.muzzleFlashGeometry.setAttribute('rand', this.randBufferAttribute);
    }
    render() {
        // Namlu pozisyonunu set et
        this.positionFoat32Array.set(muzzlePositionUtil.toArray(array3Util, 0), 0);
        this.positionBufferAttribute.needsUpdate = true;

        // Ateşleme zamanını güncelle
        this.muzzleFlashSM.uniforms.uFireTime.value = GameContext.GameLoop.Clock.getElapsedTime();

        // Rastgele bir değer set et
        const rand = Math.random();
        array1Util[0] = rand;
        this.randFloat32Array.set(array1Util, 0);
        this.randBufferAttribute.needsUpdate = true;
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        this.muzzleFlashSM.uniforms.uTime.value = elapsedTime; // Her frame için zaman verisi gönder
    }

}