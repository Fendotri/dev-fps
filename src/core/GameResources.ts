
import { Object3D, AnimationMixer, TextureLoader } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export const GameResources = {
    loader: new GLTFLoader(),
    textureLoader: new TextureLoader(),
    resourceMap: new Map<string, THREE.Object3D | THREE.AnimationMixer | THREE.AnimationClip | THREE.AnimationAction | GLTF>(),
}

/** Tüm kaynakları başlat */
export const initResource = async () => {

    const hands = GameResources.loader.loadAsync('/role/base/hand_base.glb');
    const role = GameResources.loader.loadAsync('/role/base/role_base.glb');
    const map = GameResources.loader.loadAsync('/levels/mirage.glb');

    const [gltf1, gltf2, gltf3] = await Promise.all([hands, role, map]);

    // El modeli
    let armature: THREE.Object3D;
    gltf1.scene.traverse((child: Object3D) => {
        if (child.name === 'Armature') {
            armature = child;
            GameResources.resourceMap.set(child.name, child);
        }
        if (child.type === "SkinnedMesh") {
            child.visible = false;
            GameResources.resourceMap.set(child.name, child);
        }
    });

    const animationMixer = new AnimationMixer(armature);
    GameResources.resourceMap.set('AnimationMixer', animationMixer);
    gltf1.animations.forEach((animationClip: THREE.AnimationClip) => { // AnimationActions oluşturuluyor
        const animationAction = animationMixer.clipAction(animationClip, armature);
        GameResources.resourceMap.set(animationClip.name, animationAction);
    })

    // Karakter modeli
    GameResources.resourceMap.set('Role', gltf2);

    // Harita modeli
    GameResources.resourceMap.set('Map', gltf3);

    Promise.resolve();
}


