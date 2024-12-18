import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { WebGL1Renderer, ACESFilmicToneMapping, sRGBEncoding, Color, WebGLRenderTarget, Clock, PerspectiveCamera, Scene, OrthographicCamera } from 'three';
import { getContainerStatus } from '@src/core/lib/browser_common';
import { LoopInterface } from './inferface/LoopInterface';
import { PointLock } from './PointLock';
import { Octree } from 'three/examples/jsm/math/Octree';
import { GameResources } from './GameResources';

// Başlangıçtaki konteyner ortamının ayarlanması

const container = document.querySelector('#game-view') as HTMLElement; // DOM görsel konteynerini bağlama
const initialContainerStatus = getContainerStatus(container); // Başlangıçta görsel konteynerin durumu

// Three.js render'ı başlatma

const renderer = new WebGL1Renderer({ antialias: true, alpha: false, precision: 'highp', powerPreference: 'high-performance' });
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(initialContainerStatus.width, initialContainerStatus.height);
renderer.setPixelRatio(initialContainerStatus.pixcelRatio);
renderer.setClearColor(new Color(0xffffff));
renderer.domElement.className = 'webgl';

// Three.js efekt bileştirici başlatma, r136'daki materyal değişiklikleri nedeniyle, iki render hedefinin dokularının encoding'ini manuel olarak ayarlamak gerekir

const effectCompser = new EffectComposer(renderer, new WebGLRenderTarget(initialContainerStatus.width, initialContainerStatus.height, { stencilBuffer: true }));
effectCompser.renderTarget1.texture.encoding = sRGBEncoding;
effectCompser.renderTarget2.texture.encoding = sRGBEncoding;

/** Konteyner ortamı */
export const GameContext = {

    /** Görünüm */
    GameView: {

        /** DOM konteyneri */
        Container: <HTMLElement>container,

        /** Render'ı temsil eder */
        Renderer: renderer,

        /** Efekt bileştirici */
        EffectComposer: effectCompser,
    },

    /** Oyun döngüsü */
    GameLoop: {

        /** Zamanlayıcı yardımcı objesi */
        Clock: new Clock(),

        /** Render döngüsü ID'si */
        LoopID: <number><any>undefined,

        /** Duraklatma durumu */
        Pause: <boolean><any>true,

        /** Kayıtlı döngü objeleri */
        LoopInstance: <LoopInterface[]><any>[],
    },

    /** Kameralar */
    Cameras: {

        /** Oyuncunun sahneyi izlediği kamera */
        PlayerCamera: new PerspectiveCamera(65, initialContainerStatus.width / initialContainerStatus.height, 0.1, 1000),

        /** Oyuncunun el modeli izlediği kamera */
        HandModelCamera: new PerspectiveCamera(75, initialContainerStatus.width / initialContainerStatus.height, 0.001, 5),

        /** UI için dikey kamera */
        UICamera: new OrthographicCamera(-50, 50, 50, -50, 0.001, 1001), // 正交相机: 准星 UI 等
    },

    /** Sahne */
    Scenes: {

        /** Gökyüzü kutusu */
        Skybox: new Scene(),

        /** Etkileşimli sahne */
        Level: new Scene(),

        /** Çarpışma sahnesi */
        Collision: new Scene(),

        /** El modeli sahnesi */
        Handmodel: new Scene(),

        /** UI yüzey sahnesi */
        UI: new Scene(),

        /** Sprite sahnesi */
        Sprites: new Scene(),
    },

    /** Fiziksel sistem */
    Physical: {
        WorldOCTree: <Octree>undefined,
    },

    /** Nokta kilidi */
    PointLock,

    GameResources,

    /** Yaşam döngüsü arayüz objesi */
    CycleObjects: [],

    /** Render döngüsü arayüz objesi */
    LoopObjects: [],

}

/** Pencere boyutunun değişmesini dinle */
export const onWindowResize = () => {

    // Konteynerin genişlik ve yüksekliğini al
    const { width, height, pixcelRatio } = getContainerStatus(GameContext.GameView.Container);

    // Render için boyutları ayarla
    GameContext.GameView.Renderer.setSize(width, height);
    GameContext.GameView.Renderer.setPixelRatio(pixcelRatio);

    // Perspektif kamerayı güncelle
    Array.isArray(Object.keys(GameContext.Cameras)) && Object.keys(GameContext.Cameras).forEach(key => {
        const camera = GameContext.Cameras[key];
        if (camera.aspect) camera.aspect = width / height;
        if (camera.updateProjectionMatrix) camera.updateProjectionMatrix();
    });

    // Efekt bileştirici altındaki giriş ve çıkış dokusu boyutlarını ayarla
    GameContext.GameView.EffectComposer.renderTarget1.setSize(width * pixcelRatio, height * pixcelRatio);
    GameContext.GameView.EffectComposer.renderTarget2.setSize(width * pixcelRatio, height * pixcelRatio);
}
onWindowResize();
window.addEventListener('resize', onWindowResize); // Pencere değişikliklerini dinlemek için olay kaydetme