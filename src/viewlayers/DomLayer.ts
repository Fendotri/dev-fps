import { GameContext } from '@src/core/GameContext';

import Stats from 'three/examples/jsm/libs/stats.module';
import { DomEventPipe, PointLockEvent } from '../gameplay/pipes/DomEventPipe';
import { CycleInterface } from '../core/inferface/CycleInterface';
import { LoopInterface } from '../core/inferface/LoopInterface';
import { PointLockEventEnum } from '../gameplay/abstract/EventsEnum';


/**
 * DOM Katmanı, web sayfasında WebGL çıktısının gösterilip gösterilmeyeceğini kontrol eder ve UI olaylarını yönetir
 */
export class DOMLayer extends EventTarget implements CycleInterface, LoopInterface {
    stats: Stats = Stats(); // Performans istatistiklerini gösteren nesne

    init(): void {

        // Oyun talimatları ve ipuçları
        const blocker = document.createElement('div');
        blocker.id = 'blocker'; // Ekranı engelleyen eleman
        const instructions = document.createElement('div');
        instructions.id = 'instructions' // Talimatları içeren div
        const tip1 = document.createElement('p');
        tip1.innerHTML = 'CLICK TO PLAY'; // Oyun başlatma talimatı
        instructions.appendChild(tip1);
        blocker.appendChild(instructions);
        GameContext.GameView.Container.appendChild(blocker);

        // WebGL render çıktısını sayfa konteynerine ekle
        GameContext.GameView.Container.appendChild(GameContext.GameView.Renderer.domElement);

        // PointLock (fare kilidi) olayını başlat
        GameContext.PointLock.pointLockListen();
        instructions.addEventListener('click', () => { if (!GameContext.PointLock.isLocked) GameContext.PointLock.lock(); }); // Kilitli değilse, fareyi kilitle

        // PointLock olaylarını dinle ve uygun işlemi yap
        DomEventPipe.addEventListener(PointLockEvent.type, (e: CustomEvent) => { 
            switch (e.detail.enum) {
                case PointLockEventEnum.LOCK: // Kilitleme olayı
                    instructions.style.display = 'none'; // Talimatları gizle
                    blocker.style.display = 'none'; // Engellemeyi gizle
                    break;
                case PointLockEventEnum.UNLOCK: // Kilit açma olayı
                    blocker.style.display = 'block'; // Engellemeyi göster
                    instructions.style.display = ''; // Talimatları göster
                    break;
            }
        });

        // Performans istatistiklerini sayfada göster
        GameContext.GameView.Container.appendChild(this.stats.dom);
    }

    callEveryFrame(deltaTime?: number, elapsedTime?: number): void {
        this.stats.update(); // Her frame'de performans istatistiklerini güncelle
    }

}