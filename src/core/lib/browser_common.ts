// Bu dosya, tarayıcıyla ilgili genel işlevleri tanımlar

import { GameContext } from '../GameContext';

/**
 * Mevcut üç boyutlu görünüm konteynerının { Genişlik, Yükseklik, Fiziksel Piksel / CSS Piksel Oranı }
 * @param container Üç boyutlu görünüm konteynerı
 * @returns { Genislik, Yükseklik, Fiziksel Piksel / CSS Piksel Oranı }
 */
export const getContainerStatus = (container?: HTMLElement): ViewportStatus => {
    if (!container) container = GameContext.GameView.Container;

    // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
    const { width, height } = container.getBoundingClientRect();
    
    return {
        width: width,
        height: height,
        pixcelRatio: window.devicePixelRatio,
    }
}