import {
    AddEquation, CustomBlending, FrontSide, LinearFilter, Material,
    Mesh, MeshBasicMaterial, NearestFilter, OneMinusSrcAlphaFactor,
    SrcAlphaFactor, sRGBEncoding, Texture
} from 'three';

/**
 * 
 * Eğer mesh'in materyali Blender ile hazırlanmış bir yansıma (baked) dokusu kullanıyorsa,
 * bu fonksiyon dokuyu işlemek için kullanılır.
 * 1. Dokunun kodlamasını SRGB olarak ayarlar.
 * 2. flipY'yi kapatır.
 * 
 * @param mesh Mesh objesi
 * @param texture Dokusu
 */
export const dealWithBakedTexture = (mesh: Mesh, texture: Texture) => {
    texture.encoding = sRGBEncoding; // SRGB kodlaması
    texture.flipY = false; // Y ekseninde ters çevirme yapılmaz
    const mtl = new MeshBasicMaterial({ map: texture });
    mesh.material = mtl; // Yeni materyali mesh'e uygular
}

/**
 * Mesh objesindeki ve altındaki tüm mesh'lerde 8x anisotropik filtrelemeyi etkinleştirir.
 * @param mesh Mesh objesi
 */
export const anisotropy8x = (mesh: Mesh) => {
    mesh.traverse((child: Mesh) => { // Mesh objesinin altındaki tüm çocukları gez
        if (child.isMesh) {
            child.castShadow = true; // Gölgeleri yansıtsın
            child.receiveShadow = true; // Gölgeleri alsın
            const _material = child.material as MeshBasicMaterial;
            if (_material.map) _material.map.anisotropy = 8; // 8x anisotropik filtreleme
        }
    });
}

/**
 * Minecraft tarzı karakter dokuları için işleme.
 * 1. NearestFilter mag, minFilter ile en yakın piksel alınır (bloke piksel efekti).
 * 2. SRGB encoding kullanılır.
 * 3. flipY kapatılır.
 * @param texture Dokusu
 */
export const dealWithRoleTexture = (texture: Texture) => {
    texture.generateMipmaps = false; // Mipmap oluşturulmaz
    texture.magFilter = NearestFilter; // En yakın piksel alma
    texture.minFilter = NearestFilter; // En yakın piksel alma
    texture.encoding = sRGBEncoding; // SRGB kodlaması
    texture.flipY = false; // Y ekseninde ters çevirme yapılmaz
}


/**
 * Minecraft tarzı karakter materyali için işlem.
 * 1. İki taraflı render edilir.
 * 2. Alfa testi yapılır (gizli alanları ve şeffaflık için).
 * 3. Özelleştirilmiş renk karıştırma yapılır.
 * 
 * @param material Materyal objesi
 */
export const dealWithRoleMaterial = (material: Material) => {
    material.side = FrontSide; // İki taraflı render
    material.alphaTest = 1; // Alfa testi, şeffaflık için
    material.blending = CustomBlending;  // Özelleştirilmiş karıştırma
    material.blendEquation = AddEquation; // Varsayılan karıştırma denklemi
    material.blendSrc = SrcAlphaFactor; // Varsayılan kaynak faktörü
    material.blendDst = OneMinusSrcAlphaFactor; // Varsayılan hedef faktörü
}

/**
 * Silah dokuları için işlem.
 * 1. LinearFilter mag, minFilter ile pürüzsüz renk alma yapılır.
 * 2. SRGB encoding kullanılır.
 * 3. flipY kapatılır.
 * @param texture Dokusu
 */
export const dealWithWeaponTexture = (texture: Texture) => {
    texture.generateMipmaps = true; // Mipmap oluşturulacak
    texture.magFilter = LinearFilter; // Pürüzsüz renk alma
    texture.minFilter = LinearFilter; // Pürüzsüz renk alma
    texture.encoding = sRGBEncoding; // SRGB kodlaması
    texture.flipY = false; // Y ekseninde ters çevirme yapılmaz
}