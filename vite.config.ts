import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

// https://vitejs.dev/config/
/// Vite yapılandırma dosyası
export default defineConfig({
    base: '/', // Uygulamanın temel yolu (public root)
    root: path.resolve(__dirname, './multi_pages/'), // Proje kök dizini
    publicDir: path.resolve(__dirname, './public/'), // Public dosyaların bulunduğu dizin
    assetsInclude: ['*.vert', '*.frag', '*.glsl'], // Shader dosyalarını (vert, frag, glsl) asset olarak dahil et
    build: {
        outDir: path.resolve(__dirname, './cube_gunman'), // Çıktı dizini
        target: 'esnext', // Hedef JavaScript sürümü
        sourcemap: true, // Kaynak haritalarını oluştur
        emptyOutDir: true, // Önceki çıktıyı temizle
        minify: false, // Minifikasyonu devre dışı bırak
        assetsInlineLimit: 40960, // Inline dosya boyutu sınırı (bytes)
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, './multi_pages/index.html'), // Ana sayfa
                game: path.resolve(__dirname, './multi_pages/game/index.html') // Oyun sayfası
            }
        }
    },
    resolve: {
        mainFields: ['module', 'jsnext:main', 'jsnext'], // Modül çözümleme sırasını belirtir
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], // Çözümlemede kullanılacak uzantılar
        alias: {
            '@src': path.resolve(__dirname, './src/'), // @src alias'ı
            '@assets': path.resolve(__dirname, './assets/'), // @assets alias'ı
            '@gameplay': path.resolve(__dirname, './src/gameplay/') // @gameplay alias'ı
        }
    },
    plugins: [vue(), vueJsx()], // Vue ve JSX desteği ekle
    envDir: path.resolve(__dirname, './vite_envs/'), // Ortam değişkenleri dosyasının dizini
    envPrefix: 'VITE_', // Ortam değişkenleri için prefix

    css: {
        modules: {
            generateScopedName: "[local]_[hash:base64:5]", // CSS modüllerinde benzersiz isimler oluştur
            hashPrefix: "prefix", // Hash ön eki
            localsConvention: "dashes", // CSS class adlarını `kebab-case` olarak dönüştür
        },
        preprocessorOptions: {
            scss: {
                charset: false, // SCSS dosyalarında charset içermesini engelle
            }
        }
    }
})
