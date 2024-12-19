
import upVert from '@assets/shaders/crosshair/up.vert?raw' // Üst
import downVert from '@assets/shaders/crosshair/down.vert?raw' // Alt
import leftVert from '@assets/shaders/crosshair/left.vert?raw' // Sol
import rightVert from '@assets/shaders/crosshair/right.vert?raw' // Sağ
import crossFrag from '@assets/shaders/crosshair/cross.frag?raw'

import { GameContext } from '@src/core/GameContext'
import { CycleInterface } from '@src/core/inferface/CycleInterface'
import { BufferAttribute, BufferGeometry, Color, CustomBlending, DoubleSide, Mesh, ShaderMaterial } from 'three'

// Geometri için kullanılan diziler
const indexes = new Uint16Array([0, 2, 1, 2, 3, 1]); // Üçgenlerin indeksleri
const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]); // Yüzey normalleri
const positions = new Float32Array([-.5, .5, 0, .5, .5, 0, -.5, -.5, 0, .5, -.5, 0]); // Köşe noktaları
const geom = new BufferGeometry(); // Geometri nesnesi


/**
 * 1. Parametreleri tanımla: renk, uzunluk, kalınlık, alfa, merkez noktası, aralık, hedef işaretinin stili
 * 2. Sahneye 4 adet PlaneMesh ekle ve her birini ortogonal kamera ile render et
 * 3. PlaneMesh shader'larını tanımla, GPU üzerinde hedef işaretinin konumunu hesapla ve göster
 */
export class CrosshairLayer implements CycleInterface {

    scene: THREE.Scene;
    camera: THREE.Camera;

    crossMaterials: THREE.ShaderMaterial[] = []; // Hedef işareti malzemeleri

    crosshaircolor = new Color(0, 1, 0); // Renk
    crosshairsize = .02; // Boyut
    crosshairthinkness = .004; // Kalınlık
    crosshairalpha = .8; // Alfa değeri
    crosshairdot = false; // Merkez noktası
    crosshairgap = .01; // Aralık
    crosshairstyle = 4; // 0: varsayılan, 1: statik, 2: klasik, 3: klasik dinamik, 4: klasik statik

    uniforms: {}; // Shader değişkenleri

    init(): void {
        // Sahne ve kamera ayarları
        this.scene = GameContext.Scenes.UI;
        this.uniforms = {
            uColor: { value: this.crosshaircolor },
            uSize: { value: this.crosshairsize },
            uThinkness: { value: this.crosshairthinkness },
            uGap: { value: this.crosshairgap },
            uAlpha: { value: this.crosshairalpha },
            uAspect: { value: GameContext.Cameras.PlayerCamera.aspect }
        }

        // 4 adet hedef işareti materyali oluştur
        const crossMaterial1 = new ShaderMaterial({ uniforms: this.uniforms, vertexShader: upVert, fragmentShader: crossFrag }); // Üst
        const crossMaterial2 = new ShaderMaterial({ uniforms: this.uniforms, vertexShader: downVert, fragmentShader: crossFrag }); // Alt
        const crossMaterial3 = new ShaderMaterial({ uniforms: this.uniforms, vertexShader: leftVert, fragmentShader: crossFrag }); // Sol
        const crossMaterial4 = new ShaderMaterial({ uniforms: this.uniforms, vertexShader: rightVert, fragmentShader: crossFrag }); // Sağ

        // Kamera boyutları değiştiğinde uniform'ları güncelle
        window.addEventListener('resize', () => { 
            crossMaterial1.uniforms.uAspect.value = GameContext.Cameras.PlayerCamera.aspect;
            crossMaterial2.uniforms.uAspect.value = GameContext.Cameras.PlayerCamera.aspect;
            crossMaterial3.uniforms.uAspect.value = GameContext.Cameras.PlayerCamera.aspect;
            crossMaterial4.uniforms.uAspect.value = GameContext.Cameras.PlayerCamera.aspect;
        });

        // 4 adet plane mesh için geometri tanımlaması

        geom.setIndex(new BufferAttribute(indexes, 1)); // İndeksler
        geom.setAttribute('position', new BufferAttribute(positions, 3)); // Konumlar
        geom.setAttribute('normal', new BufferAttribute(normals, 3)); // Normaller

        // Mesh oluştur ve sahneye ekle
        const cross1 = new Mesh(geom, crossMaterial1);
        const cross2 = new Mesh(geom, crossMaterial2);
        const cross3 = new Mesh(geom, crossMaterial3);
        const cross4 = new Mesh(geom, crossMaterial4);

        this.scene.add(cross1);
        this.scene.add(cross2);
        this.scene.add(cross3);
        this.scene.add(cross4);

        this.crossMaterials.push(crossMaterial1);
        this.crossMaterials.push(crossMaterial2);
        this.crossMaterials.push(crossMaterial3);
        this.crossMaterials.push(crossMaterial4);

        // Malzemelere özel özellikler ekle
        this.crossMaterials.forEach(item => {
            item.blending = CustomBlending;
            // item.depthTest = THREE.NeverDepth;
            item.side = DoubleSide; // Hem ön hem arka yüzey
            item.dithering = true; // Dithering etkin
            item.transparent = true; // Saydamlık etkin
        })

    }

    // Hedef işaretinin aralığını ayarlamak için fonksiyon
    setGap(gapSize: number) {
        if (this.uniforms['uGap']) this.uniforms['uGap'].value = gapSize;
    }

}