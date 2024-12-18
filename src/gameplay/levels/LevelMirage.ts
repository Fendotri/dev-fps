

import { Octree } from 'three/examples/jsm/math/Octree';
import { GameContext } from '@src/core/GameContext';
import { anisotropy8x, dealWithBakedTexture } from '@src/core/lib/threejs_common';
import { GameObjectMaterialEnum } from '../abstract/GameObjectMaterialEnum';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { CycleInterface } from '@src/core/inferface/CycleInterface';


class LevelMirage implements CycleInterface {

    init() {

        const boardScene = GameContext.Scenes.Level; // Oyun sahnesini alıyoruz (Level sahnesi)

        // Fiziksel octree haritasını oluştur
        const octTree: Octree = new Octree();
        GameContext.Physical.WorldOCTree = octTree; // Fiziksel dünya octree'sini kaydet
        const gltf = GameContext.GameResources.resourceMap.get('Map') as GLTF; // 'Map' adıyla kaynakları alıyoruz
        const boardMesh = gltf.scene.children[0]; // Render edilecek olan ana ağ meshini alıyoruz
        const physicsMesh = gltf.scene; // Fiziksel hesaplamalar için gereken tüm sahneyi alıyoruz
        octTree.fromGraphNode(physicsMesh); // Fiziksel veriyi memoriye yüklüyoruz

        // Harita dokusunun işlenmesi
        const bakedTexture = GameContext.GameResources.textureLoader.load('/levels/t.mirage.baked.75.jpg'); // Önceden pişirilmiş doku yüklüyoruz
        dealWithBakedTexture(boardMesh as THREE.Mesh, bakedTexture); // Baked texture'ı mesh'e bağlıyoruz
        anisotropy8x(boardMesh as THREE.Mesh); // Anizotropik filtrelemeyi 8x olarak ayarlıyoruz

        // Oyun mantığına uygun materyali bağla
        boardMesh.userData['GameObjectMaterialEnum'] = GameObjectMaterialEnum.GrassGround; // Mesh'e oyun materyali ekliyoruz
        boardScene.add(boardMesh); // Sahneye render edilecek olan mesh'i ekliyoruz
    }

}

export { LevelMirage }