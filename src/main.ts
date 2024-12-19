import 'normalize.css'
import '@assets/css/style.scss'
import { GameContext } from '@src/core/GameContext';
import { CycleInterface } from './core/inferface/CycleInterface';
import { LoopInterface } from './core/inferface/LoopInterface';
import { initResource } from './core/GameResources';

// Model kaynaklarını yükle
initResource().then(() => {

    // GameObjectMap modülünü yükle ve loop ve cycle objelerini oluştur
    import('./core/GameObjectMap').then(({ GameObjectsMap }) => {

        // GameObjectsMap üzerinde dön ve her bir objeyi uygun listeye ekle
        GameObjectsMap.forEach((value, key, map) => {
            if ((<CycleInterface><any>value).init) GameContext.CycleObjects.push(value); // Cycle objelerini ekle
            if ((<LoopInterface><any>value).callEveryFrame) GameContext.LoopObjects.push(value); // Loop objelerini ekle 
        })

        console.warn('Resources Loaded', GameContext); // Kaynaklar yüklendi mesajı

        // Cycle objeleri üzerinde dönüp her birinin init fonksiyonunu çağır
        for (let i = 0; i < GameContext.CycleObjects.length; i++) {
            <CycleInterface>GameContext.CycleObjects[i].init();
        }

        loop(); // Animasyon loop fonksiyonunu başlat
    })

});

// Ana döngü fonksiyonu
const loop = () => {
    const deltaTime = GameContext.GameLoop.Clock.getDelta(); // Delta zamanı al
    const elapsedTime = GameContext.GameLoop.Clock.getElapsedTime(); // Geçen süreyi al

    // LoopID: Animasyon döngüsünü başlat
    GameContext.GameLoop.LoopID = window.requestAnimationFrame(() => { loop(); });

    // LoopObjects üzerinde dönüp her birinin her frame için fonksiyonunu çağır
    for (let i = 0; i < GameContext.LoopObjects.length; i++) {
        GameContext.LoopObjects[i].callEveryFrame(deltaTime, elapsedTime);
    }

    // Oyun duraklama durumu
    GameContext.GameLoop.Pause = false;
}

// Oyun duraklatma fonksiyonu
const pause = () => {
    if (!GameContext.GameLoop.Pause) {
        window.cancelAnimationFrame(GameContext.GameLoop.LoopID); // Animasyon döngüsünü durdur
        GameContext.GameLoop.Pause = true; // Duraklatma durumunu ayarla
    }
    else loop(); // Duraklama yoksa döngüyü tekrar başlat
}

// 'P' tuşuna basıldığında oyun duraklatma fonksiyonunu tetikle
window.addEventListener('keyup', function (e: KeyboardEvent) {
    if (e.code === 'KeyP') pause();
});

