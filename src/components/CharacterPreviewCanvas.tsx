import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterId, HatId } from '../types/game';
import { CharacterAnimRefs, createCharacterMesh } from '../game/proceduralModels';

interface CharacterPreviewCanvasProps {
  characterId: CharacterId;
  hatId: HatId;
}

export const CharacterPreviewCanvas: React.FC<CharacterPreviewCanvasProps> = ({
  characterId,
  hatId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.3, 4.2);
    camera.lookAt(0, 0.85, 0);

    // Warm friendly lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x90e0ef, 0.8);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // Pedestal stage
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x588157,
      roughness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const borderGeo = new THREE.TorusGeometry(1.42, 0.06, 12, 32);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = Math.PI * 0.5;
    border.position.y = 0.0;
    scene.add(border);

    // Character Group container
    // Because character's forward axis is -Z for running gameplay,
    // we rotate it by Math.PI (180 degrees) in preview so its smiling face looks at the user!
    const charWrapper = new THREE.Group();
    charWrapper.rotation.y = Math.PI;
    scene.add(charWrapper);

    let charRefs: CharacterAnimRefs = createCharacterMesh(characterId, hatId);
    charWrapper.add(charRefs.root);

    let frameId = 0;
    let time = 0;
    let isDragging = false;
    let prevPointerX = 0;
    let targetRotationY = Math.PI;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        prevPointerX = e.clientX;
        targetRotationY += deltaX * 0.015;
      }
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.03;

      if (!isDragging) {
        // Slow gentle idle sway
        targetRotationY += 0.006;
      }

      charWrapper.rotation.y = THREE.MathUtils.damp(charWrapper.rotation.y, targetRotationY, 10, 0.03);

      // Cute idle breathing & ear twitch
      charRefs.head.position.y = 1.25 + Math.sin(time * 2) * 0.04;
      charRefs.head.rotation.z = Math.sin(time) * 0.06;
      charRefs.tail.rotation.y = Math.sin(time * 3) * 0.35;
      charRefs.leftEar.rotation.z = -0.3 + Math.sin(time * 4) * 0.08;
      charRefs.rightEar.rotation.z = 0.3 - Math.sin(time * 4) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [characterId, hatId]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      title="Drag to spin character"
    />
  );
};
