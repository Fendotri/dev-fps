// https://www.3dmgame.com/gl/3626154_2.html

/** CSGO geri tepme (recoil) araçları */
export class AutomaticWeaponBPointsUtil {

    /**
     * CSGO geri tepme diyagramındaki mermi pozisyonlarını ekran koordinatlarına dönüştürür.
     * Ekran koordinatları: Standartlaştırılmış cihaz koordinatlarında, X ve Y bileşenleri -1 ile 1 arasında olmalıdır.
     * 1. CSGO geri tepme diyagramındaki ilk mermi ekranın ortasında [0, 0] olarak kabul edilir.
     * 2. Geri tepme diyagramındaki mermiler arasındaki X, Y kaymalarını (delta) hesaplar.
     * 3. Diyagramın kaydedildiği ekran çözünürlüğüne göre bu kaymalar ölçeklendirilir.
     * 4. Ekran merkezine göre kaymalarla ekran koordinatları çizilir.
     * 5. Geri tepme kuvvetinin etkisi uygulanır.
     * 
     * @param bulletPositionArray: Geri tepme diyagramındaki mermi pozisyonlarını içeren dizi
     * @param bulletNumber: Geri tepme diyagramındaki mermi sayısı
     * @param rateX: Geri tepme diyagramı kaydedilirken kullanılan yatay ölçekleme oranı
     * @param rateY: Geri tepme diyagramı kaydedilirken kullanılan dikey ölçekleme oranı
     * @param recoilForce: Geri tepme kuvveti
     * @returns: [-1, 1] arasında normalize edilmiş ekran koordinatları içeren dizi
     */
    static bulletPositionArray2ScreenCoordArray = function (bulletPositionArray: number[], bulletNumber: number, rateX: number, rateY: number, recoilForce: number) {

        // Çıktı için boş bir dizi oluşturuyoruz
        const bulletDeltaArray = []

        let baseX = bulletPositionArray[0]; // Geri tepme diyagramındaki merkezdeki X koordinatı
        let baseY = bulletPositionArray[1]; // Geri tepme diyagramındaki merkezdeki Y koordinatı

        const pmMX = 960; // Ekran çözünürlüğünde, ekranın ortasında X koordinatı
        const pmMy = 540; // Ekran çözünürlüğünde, ekranın ortasında Y koordinatı

        // Her bir mermi için ekran koordinatlarını hesaplıyoruz
        for (let i = 0; i < bulletNumber; i++) {

            // Merkezden (baseX, baseY) uzaklıkları hesaplıyoruz

            let i2_x = bulletPositionArray[2 * i] - baseX;
            let i2_y = bulletPositionArray[2 * i + 1] - baseY;

            // Geri tepme ve ölçekleme oranlarını uyguluyoruz

            i2_x = i2_x * rateX * recoilForce;
            i2_y = i2_y * rateY * recoilForce;

            // Ekran koordinatlarına yerleştiriyoruz

            bulletDeltaArray[2 * i] = pmMX + i2_x;
            bulletDeltaArray[2 * i + 1] = pmMy - i2_y;

        }

        // Ekran koordinatlarını normalize ediyoruz
        for (let i = 0; i < bulletNumber; i++) {
            bulletDeltaArray[2 * i] = (bulletDeltaArray[2 * i] - 960) / 960;
            bulletDeltaArray[2 * i + 1] = (bulletDeltaArray[2 * i + 1] - 540) / 540;
        }

        // Sonuç olarak normalize edilmiş koordinatları döndürüyoruz
        return bulletDeltaArray;
    }


    /**
     * CSGO geri tepme diyagramındaki mermilerin değişim pozisyonlarını ekran koordinatlarına dönüştürür.
     * Ekran koordinatları: Standartlaştırılmış cihaz koordinatlarında, X ve Y bileşenleri -1 ile 1 arasında olmalıdır.
     * 1. CSGO geri tepme diyagramındaki ilk mermi ekranın ortasında [0, 0] olarak kabul edilir.
     * 2. Geri tepme diyagramındaki mermiler arasındaki X, Y kaymalarını (delta) hesaplar.
     * 3. Diyagramın kaydedildiği ekran çözünürlüğüne göre bu kaymalar ölçeklendirilir.
     * 4. Ekran merkezine göre kaymalarla ekran koordinatları çizilir.
     * 5. Geri tepme kuvvetinin etkisi uygulanır.
     * 
     * @param bulletPositionArray: Geri tepme diyagramındaki mermi pozisyonlarını içeren dizi
     * @param bulletNumber: Geri tepme diyagramındaki mermi sayısı
     * @param rateX: Geri tepme diyagramı kaydedilirken kullanılan yatay ölçekleme oranı
     * @param rateY: Geri tepme diyagramı kaydedilirken kullanılan dikey ölçekleme oranı
     * @param recoilForce: Geri tepme kuvveti
     * @returns: [-1, 1] arasında normalize edilmiş ekran koordinatları içeren dizi
     */
    static bulletDeltaPositionArray2ScreenCoordArray = function (bulletPositionArray: number[], bulletNumber: number, rateX: number, rateY: number, recoilForce: number) {

        // Çıktı için boş bir dizi oluşturuyoruz
        const bulletDeltaArray = []

        let baseX = bulletPositionArray[0]; // Geri tepme diyagramındaki merkezdeki X koordinatı
        let baseY = bulletPositionArray[1]; // Geri tepme diyagramındaki merkezdeki Y koordinatı

        const pmMX = 960; // Ekran çözünürlüğünde, ekranın ortasında X koordinatı
        const pmMy = 540; // Ekran çözünürlüğünde, ekranın ortasında Y koordinatı

        // Her bir mermi için ekran koordinatlarını hesaplıyoruz
        for (let i = 0; i < bulletNumber; i++) {

            // Merkezden (baseX, baseY) uzaklıkları hesaplıyoruz

            let i2_x = bulletPositionArray[2 * i] - baseX;
            let i2_y = bulletPositionArray[2 * i + 1] - baseY;

            // Geri tepme ve ölçekleme oranlarını uyguluyoruz

            i2_x = i2_x * rateX * recoilForce;
            i2_y = i2_y * rateY * recoilForce;

            // Ekran koordinatlarına yerleştiriyoruz
            bulletDeltaArray[2 * i] = pmMX + i2_x;
            bulletDeltaArray[2 * i + 1] = pmMy - i2_y;

        }

        // Ekran koordinatlarını normalize ediyoruz
        for (let i = 0; i < bulletNumber; i++) {
            bulletDeltaArray[2 * i] = (bulletDeltaArray[2 * i] - 960) / 960;
            bulletDeltaArray[2 * i + 1] = (bulletDeltaArray[2 * i + 1] - 540) / 540;
        }

        // İlk mermiyi referans alarak diğer mermilerin değişim pozisyonlarını hesaplıyoruz
        let baseXResolved = bulletDeltaArray[0];
        let baseYResolved = bulletDeltaArray[1];

        for (let i = 0; i < bulletNumber; i++) {

            let i2_x = bulletDeltaArray[2 * i];
            let i2_y = bulletDeltaArray[2 * i + 1];

            bulletDeltaArray[2 * i] = bulletDeltaArray[2 * i] - baseXResolved;
            bulletDeltaArray[2 * i + 1] = bulletDeltaArray[2 * i + 1] - baseYResolved;

            baseXResolved = i2_x;
            baseYResolved = i2_y;

        }

        // Sonuç olarak normalize edilmiş değişim pozisyonlarını döndürüyoruz
        return bulletDeltaArray;
    }

}