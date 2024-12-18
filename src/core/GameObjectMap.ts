import { LevelMirage } from '../gameplay/levels/LevelMirage';
import { LocalPlayer } from '../gameplay/player/LocalPlayer';
import { DOMLayer } from '../viewlayers/DomLayer';
import { GLViewportLayer } from '../viewlayers/GLViewportLayer';
import { BulletHoleAshLayer } from '../viewlayers/scene/BulletHoleAshLayer';
import { BulletHoleFlashLayer } from '../viewlayers/scene/BulletHoleFlashLayer';
import { BulletHoleLayer } from '../viewlayers/scene/BulletHoleLayer';
import { SkyLayer } from '../viewlayers/SkyLayer';
import { CrosshairLayer } from '../viewlayers/ui/CrosshairLayer';
import { HandModelLayer } from '../viewlayers/ui/HandModelLayer';
import { ChamberBulletShell } from '../viewlayers/weapon/ChamberBulletShellLayer';
import { ChamberSmokeLayer } from '../viewlayers/weapon/ChamberSmokeLayer';
import { MuzzleFlashLayer } from '../viewlayers/weapon/MuzzleFlashLayer';
import { CycleInterface } from './inferface/CycleInterface';
import { LoopInterface } from './inferface/LoopInterface';

const GameObjects: Array<LoopInterface | CycleInterface> = [
    new DOMLayer(), // DOM katmanı
    new SkyLayer(), // Gökyüzü kutusu
    new HandModelLayer(), // El modeli
    new CrosshairLayer(), // Nişangah
    new BulletHoleLayer(), // Mermi deliği
    new BulletHoleFlashLayer(), // Tek delik flaşı
    new BulletHoleAshLayer(), // Tek delik külü
    new ChamberBulletShell(), // Mermi kabuğu
    new ChamberSmokeLayer(), // Mermi kabuğu dumanı
    new MuzzleFlashLayer(), // Namlu flaşı
    new GLViewportLayer(), // WEBGL render katmanı
    new LevelMirage(),
    LocalPlayer.getInstance(),
];

/** Oyun paketleme tip nesnesi */
export const GameObjectsMap = new Map<string, LoopInterface | CycleInterface>();
GameObjects.forEach(item => { GameObjectsMap.set(item.constructor.name, item); })