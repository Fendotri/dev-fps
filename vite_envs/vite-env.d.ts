/// <reference types="vite/client" />

// .vue dosyalarını Vite ile kullanabilmek için modül tanımlaması
declare module '*.vue' {
    import type { DefineComponent } from 'vue' // Vue bileşenlerini tanımak için gerekli türü içeri al
    const component: DefineComponent<{}, {}, any> // Vue bileşeni türünü tanımla
    export default component // Bileşeni varsayılan olarak dışa aktar
}

// Vite'nin ek olarak tanıyacağı dosya türleri için modül tanımlamaları

// .vert dosyalarını string olarak tanımla (genellikle vertex shader dosyaları)
declare module '*.vert' {
    export default string // .vert dosyasını string olarak dışa aktar
}

// .frag dosyalarını string olarak tanımla (genellikle fragment shader dosyaları)
declare module '*.frag' {
    export default string // .frag dosyasını string olarak dışa aktar
}
