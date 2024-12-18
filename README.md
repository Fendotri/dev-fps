# Proje Tanıtımı
Vite'yi yapılandırma aracı olarak, TypeScript ve Three.js'i render kütüphanesi olarak kullanarak tarayıcıda WebGL 3D bir atış oyunu örneği oluşturulmuştur;  
Bu proje, grafikler ve Three.js kütüphanesini sistemli bir şekilde öğrenip çalıştıktan sonra yapılan küçük bir alıştırmadır.

Öğrenmek/başvurmak için kullanılabilecek noktalar:
1. **TypeScript ile oyun seviyesi kod çerçevesi oluşturulması**
   1. **Sistemlerin bölünmesi/kapalı hale getirilmesi**: Silah sistemi (tam otomatik/yarı otomatik/bıçak), envanter sistemi, hareket sistemi
   2. **JavaScript modül paketleme**: Modülün bir kapsayıcı olarak kullanımı
   3. **Efekt/Render katmanı** (`./src/viewlayers/*`) uygulama mantığı
2. **Ön uç karmaşık dosya yapısı/paketleme yapısının referansı** (paketleme araçlarının kavranması gereklidir)
3. **Three.js VBO efekt kod stili ve çeşitli efekt uygulama referansları**
4. **Blender ile sahne pişirme/animasyon yapımı**

Şu anda eklenmiş görsel/efekt efektler:
1. **Kovan çıkışı ve kaybolma efekti**
2. **Ateş etme sahnesi dumanı**
3. **Namlu flaş efekti**
4. **Kurşun deliği ve çukur efekti**
5. **Kurşun deliği vurma flaş efekti**
6. **Kurşun deliği vurma duman efekti**

Şu anda dışa aktarılan silahlar:
1. **Ana silah**: AK47
2. **Yan silah**: USP
3. **Bıçak**: M9

Blender'dan silah animasyon dışa aktarma parça isimleri (kod otomatik olarak animasyonu okur):
1. `<weaponName>_equip` - Silah donanım animasyonu
2. `<weaponName>_reload` - Silah mermi doldurma animasyonu
3. `<weaponName>_fire` - Silah ateş etme animasyonu
4. `<weaponName>_hold` - Silah tutma animasyonu
5. `<weaponName>_view` - Silah gösterme animasyonu

Ücretsiz kaynaklar:
1. **NetEase Buff mağazası** (Silah modelleri, dokular) [https://buff.163.com/](https://buff.163.com/)
2. **Minecraft karakter derisi sitesi** (aynı UV karakter derisi) [http://skin.minecraftxz.com/](http://skin.minecraftxz.com/)
3. **Mermilerin yolu**: CSGO Çince web sitesinde mermi yolunun gif'ini inceleyerek, çizim araçlarıyla x ve y koordinatlarını manuel olarak hesaplayarak her mermi noktası bilgisini alın.  
   1. Kullanırken, bazı program gürültüsü eklemeyi unutmayın.

# Çevrimiçi Deneyim Bağlantısı
Sunucum herhangi bir zamanda kapanabilir, bu yüzden dikkatli olun!  
[http://101.34.53.23/projects/fps-game-website/index.html](http://101.34.53.23/projects/fps-game-website/index.html)

**Kontrol Talimatları**:
- WASD ile hareket et
- 123Q ile silah değiştir
- Sol fare tuşu ile ateş et
- R tuşu ile şarjör değiştir

# Yapılacaklar/ Zorluklar
**Yapılacaklar**:
1. Karakterin baş aşağı dönüşümünü, perspektif kontrolü ile iskelet hareketi
2. Karakter hareket animasyonlarını karıştırma

**Zorluklar**:
1. **Etkili sahne çarpışma tespiti** (farklı algoritmalar), ben halihazırda **Octree**'yi kullanıyorum
2. **Dekal (çıkıntı)** efektleri
3. **Ağ senkronizasyonu/ Gecikme algoritması** (oyuncular arası çarpışmalar)
4. **Ragdoll (beden fiziği)**
5. Three.js içinde yazıların daha iyi render edilmesi

# Diğer Yüksek Kaliteli Kaynaklar/Referanslar
1. **Three.js ile yapay zeka**: Three.js'in yazarlarından biri tarafından yazılmıştır. [https://github.com/Mugen87/yuka](https://github.com/Mugen87/yuka)
2. **İskelet ve kullanıcı etkileşimi**: [https://codepen.io/kylewetton/pen/WNNeyWJ?editors=0010](https://codepen.io/kylewetton/pen/WNNeyWJ?editors=0010)
3. **WebSocket örneği ve Vite'in WebSocket eklentisi**: [https://gitee.com/lian_1998](https://gitee.com/lian_1998)
4. **Krunker'ın Steam'de yayımlanan WebGL tasarım oyunu**: [https://krunker.io/](https://krunker.io/)
