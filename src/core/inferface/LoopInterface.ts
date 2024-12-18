/**
 * Oyun karesi render edildikçe sürekli olarak çağrılacak arayüz
 */
export type LoopInterface = {

    /**
     * Oyun her kare render edildiğinde çağrılacak
     * @param deltaTime Son kare ile arasındaki geçen süre
     * @param elapsedTime İlk kareden itibaren geçen süre
     */
    callEveryFrame(deltaTime?: number, elapsedTime?: number): void;
    
}