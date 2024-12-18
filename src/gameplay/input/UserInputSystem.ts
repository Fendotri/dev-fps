import { UserInputEventEnum } from '../abstract/EventsEnum';
import { UserInputEventPipe, UserInputEvent, } from '../pipes/UserinputEventPipe';

/** 
 *  İşlemci, oyuncu giriş tuşları ile hareketleri kontrol eder
 */
export class UserInputSystem {

    constructor() {
        this.browserEnviromentDefaultBinding();
    }

    /**
     * Tarayıcı ortamında varsayılan tuş bağlamalarını yapar
     */
    browserEnviromentDefaultBinding() {
        // Fare olayları
        document.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.button === 0) { // Fare sol tuşu ile ateş etme durumunu bağlar
                UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_TRIGGLE_DOWN;
                UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
            }
        })
        document.addEventListener('mouseup', (e: MouseEvent) => {
            if (e.button === 0) { // Fare sol tuşunun bırakılması ile ateş etme durumunu bağlar
                UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_TRIGGLE_UP;
                UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
            }
        })

        // Klavye olayları
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyR': // Mermi değiştir (yeniden yükle)
                    UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_RELOAD;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;

                case 'Digit1': // Birinci silahı seç
                    UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_SWITCH_PRIMARY_WEAPON;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'Digit2': // İkinci silahı seç
                    UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_SWITCH_SECONDARY_WEAPON;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'Digit3': // Yakın dövüş silahını seç
                    UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_SWITCH_MALEE_WEAPON;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyQ': // Son silaha geç
                    UserInputEvent.detail.enum = UserInputEventEnum.BUTTON_SWITCH_LAST_WEAPON;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;

                case 'KeyW': // Oyuncu ileri hareket
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_FORWARD_DOWN;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyA': // Oyuncu sola hareket
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_LEFT_DOWN;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyS': // Oyuncu geri hareket
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_BACKWARD_DOWN;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyD': // Oyuncu sağa hareket
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_RIGHT_DOWN;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'Space': // Oyuncu zıplar
                    UserInputEvent.detail.enum = UserInputEventEnum.JUMP;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;

            }

        })
        document.addEventListener('keyup', (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': // İleri hareket serbest bırakıldı
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_FORWARD_UP;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyA': // Sola hareket serbest bırakıldı
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_LEFT_UP;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyS': // Geri hareket serbest bırakıldı
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_BACKWARD_UP;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
                case 'KeyD': // Sağa hareket serbest bırakıldı
                    UserInputEvent.detail.enum = UserInputEventEnum.MOVE_RIGHT_UP;
                    UserInputEventPipe.dispatchEvent(UserInputEvent); // Olayı gönderir
                    break;
            }
        })
    }

}