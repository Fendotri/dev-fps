import { IncomingMessage } from 'http';
import url from 'url';
import { WebSocketServer } from 'ws';
import type { Logger, Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import vite from 'vite';
import path from 'path';
import { yellow } from 'kolorist';

interface Options {
    /**
     * websocket istek ön eki, tüm upgrade(ws) protokol isteklerini dinler, websocketRequestPrefix ile başlayan websocket isteklerini işler
     * ws://127.0.0.1:3699/wstest
     * @type string
     * @default 'wstest'
     */
    websocketRequestPrefix?: string;

    /**
     * websocket sunucu örneği tanım dosyası (config.root'a göre)
     * @type string
     * @default './server/ws/ws.test.ts'
     */
    websocketRootFile?: string;
}

let defaultOption: Options = { websocketRequestPrefix: '/wstest', websocketRootFile: './server/ws/ws.test.ts' };

let viteDevServerInstance: vite.ViteDevServer; // Geliştirme sunucu nesnesi
let logger: Logger; // Geliştirme sunucu günlük nesnesi

/**
 * Yerel istemci için websocket geliştirmesini destekler, genel iş akışı aşağıdaki gibidir
 * 1. vite başlatıldığında yeni bir sunucu örneği oluşturulur;
 * 2. Örnek, tüm upgrade(ws) protokol isteklerini dinler, websocketRequestPrefix ile başlayan websocket isteklerini işler
 * 3. Bağlantı isteği yeniden oluşturulur => İstek kendi oluşturduğumuz sunucu tarafından engellenir => websocketRootFile'deki ts dosyasını dinamik olarak derler
 * Bu eklenti websocket kodu güncellendikten sonra yeni kodu derlemek için bağlantının yeniden kurulmasını gerektirir, tembel güncelleme yapılır
 * @returns Plugin
 */
export default function ViteWsPlugin(option: Options = {}): Plugin {

    return {

        name: 'vite-plugin-ws',

        configResolved(config: ResolvedConfig) { // Konfigürasyon dosyasını çözümleyip birleştirir
            defaultOption.websocketRootFile = path.resolve(config.root, './', defaultOption.websocketRootFile); // Dosya yolunu günceller
            defaultOption = Object.assign(defaultOption, option);
        },

        configureServer(viteDevServer: ViteDevServer) { // Geliştirme sunucusunu yapılandırmak için bir kancadır, genellikle özel ara yazılımlar ekler
            viteDevServerInstance = viteDevServer;
            logger = viteDevServer.config.logger;
            try {
                viteDevServerInstance.httpServer.on('upgrade', async function upgrade(request: IncomingMessage, socket: any, head: any) { // Websocket bağlantısı kurma isteği alındığında
                    const { pathname } = url.parse(request.url); // İsteğin yolunu alır
                    if (pathname === defaultOption.websocketRequestPrefix) { // Engelleme
                        let { wss } = await viteDevServerInstance.ssrLoadModule(defaultOption.websocketRootFile); // // ssrLoadModule(API) ile ESModule derler
                        <WebSocketServer>wss.handleUpgrade(request, socket, head, async function done(ws: WebSocket) { wss.emit('connection', ws, request); });
                    }
                });
                viteDevServerInstance.httpServer?.once("listening", () => {
                    // > Websocket Listening: ws://localhost:3000/wstest \n
                    setTimeout(() => { console.log(`  > Websocket Listening: ${yellow(`ws://localhost:${viteDevServerInstance.config.server.port}${defaultOption.websocketRequestPrefix}`)} \n`); }, 0);
                });
            } catch (e) {
                viteDevServerInstance.ssrFixStacktrace(e); // Hata izleme için yığıt hatalarını düzeltir
                console.log(e);
            }
        }

    }

}