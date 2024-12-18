import { DomPipe } from '@src/core/DOMPipe';
import { UserInputEventEnum } from '../abstract/EventsEnum';

/**
 * Tüm kullanıcı giriş işlemlerini kaydetmek için kullanılan pipe
 */
export const UserInputEventPipe = new DomPipe();

/**
 * Kullanıcı giriş olayını temsil eden event
 * Bu olay, kullanıcıdan gelen çeşitli girişleri yakalamak ve işlemek için kullanılır.
 */
export const UserInputEvent = new CustomEvent<{ enum: UserInputEventEnum }>('input', {
    detail: { enum: undefined } // Olayın detayında kullanılan enum, başlangıçta 'undefined'
});
