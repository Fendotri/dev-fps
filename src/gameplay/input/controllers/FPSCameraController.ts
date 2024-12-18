import { GameContext } from "@src/core/GameContext";
import { CycleInterface } from '@src/core/inferface/CycleInterface';
import { DomEventPipe, PointLockEvent } from '@src/gameplay/pipes/DomEventPipe';
import { PointLockEventEnum } from '@src/gameplay/abstract/EventsEnum';

// Mouse ayarları: DPI ve hassasiyet
const mouseConfig = { 
    dpi: 1000, // DPI: Ekranda bir inç başına kaç piksel olduğu
    mouseSensitivity: 0.5 // Fare hassasiyeti, daha küçük bir değer daha hassas hareket sağlar
}

const _PI_2 = Math.PI / 2; // PI/2: Kameranın yatay (x) ve dikey (y) rotasında sınırları belirlemek için kullanılır

/**
 * FPS Kamera Kontrol Sınıfı
 * Bu sınıf, FPS oyunlarında kamerayı fare hareketleriyle kontrol etmeyi sağlar.
 * Kamera rotasını 'YXZ' sırasına göre değiştirir; Y ekseni Yaw (yatay hareket), X ekseni Pitch (dikey hareket) için kullanılır.
 */
export class FPSCameraController extends EventTarget implements CycleInterface {

    domElement: HTMLElement; // Oyun görünümünün konteyneri
    camera: THREE.Camera; // FPS kamerası

    init(): void {
        // Kamera, GameContext üzerinden alınır
        this.camera = GameContext.Cameras.PlayerCamera;

        // Kameranın rotalama sırası 'YXZ' olarak ayarlanır, bu FPS oyunlarında daha yaygın bir kullanım şeklidir
        this.camera.rotation.order = 'YXZ';

        // DOM elementini GameContext'ten alır
        this.domElement = GameContext.GameView.Container;

        const scope = this;

        // Fare hareketiyle ilgili event listener eklenir
        DomEventPipe.addEventListener(PointLockEvent.type, function (e: CustomEvent) {
            switch (e.detail.enum) {
                case PointLockEventEnum.MOUSEMOVE:
                    const { dpi, mouseSensitivity } = mouseConfig; // Fare hassasiyetini ve DPI ayarlarını al

                    // Ekran koordinatları, fare hareketinin X ve Y eksenlerine göre hesaplanır
                    const screenTrasformX = e.detail.movementX / dpi * mouseSensitivity; // Fare hareketinin yatay dönüşümü
                    const screenTrasformY = e.detail.movementY / dpi * mouseSensitivity; // Fare hareketinin dikey dönüşümü

                    // Kameranın yatay (yaw) ve dikey (pitch) rotasını fare hareketine göre değiştir
                    scope.camera.rotation.y = scope.camera.rotation.y - screenTrasformX; // Y ekseninde (yatay)
                    // X ekseninde (dikey) hareketin sınırları -PI/2 ve +PI/2 arasına sıkıştırılır
                    scope.camera.rotation.x = Math.max(_PI_2 - Math.PI, Math.min(_PI_2 - 0, scope.camera.rotation.x - screenTrasformY));
                    break;

            }

        })

    }

}