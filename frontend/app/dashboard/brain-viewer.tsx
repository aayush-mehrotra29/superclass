'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function BrainViewer({ time, preview, view, reset }: { time: number; preview: boolean; view: string; reset: number }) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls; uniforms: { uTime: {value: number}; uPreview: {value:number} } } | null>(null);
  const [state, setState] = useState('Loading 3D anatomy…');
  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true }); }
    catch { setState('3D preview needs WebGL. The rest of the workspace is available.'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
    camera.position.set(3.4, .65, 2.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping=true; controls.enablePan=false; controls.enableZoom=false;
    controls.target.set(0,0,0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8c9aa9, 2.5));
    const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(-3,4,5); scene.add(light);
    const rim = new THREE.DirectionalLight(0xd9eaff, 1.5); rim.position.set(3,1,-3); scene.add(rim);
    const group = new THREE.Group(); scene.add(group);
    const uniforms = { uTime: {value:0}, uPreview:{value:0} };
    viewer.current = { camera, controls, uniforms };
    let disposed=false;
    const dispose = (root: THREE.Object3D) => root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material:THREE.Material) => {
          Object.values(material).forEach(value => { if (value instanceof THREE.Texture) value.dispose(); });
          material.dispose();
        });
      }
    });
    new GLTFLoader().load('/models/brain.glb', gltf => {
      if (disposed) { dispose(gltf.scene); return; }
      gltf.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3());
      const scale=2.5/Math.max(size.x,size.y,size.z);
      gltf.scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        const geometry = object.geometry.clone();
        geometry.applyMatrix4(object.matrixWorld); geometry.translate(-center.x,-center.y,-center.z); geometry.scale(scale,scale,scale); geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({ color:0xdce2e7, roughness:.66, metalness:0, side:THREE.DoubleSide });
        // Illustrative color field only. This anatomical mesh is not registered to fMRI vertices.
        material.onBeforeCompile = shader => {
          Object.assign(shader.uniforms, uniforms);
          shader.vertexShader = 'varying vec3 vSurface;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSurface = position;');
          shader.fragmentShader = 'varying vec3 vSurface; uniform float uTime; uniform float uPreview;\n' + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
            float signal = sin(vSurface.x*5.0 + uTime*.014) * cos(vSurface.y*5.0-uTime*.009) * sin(vSurface.z*4.0+1.0);
            float mask = smoothstep(.30,.72,signal) * uPreview;
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.08,.53,.96), mask*.9);`);
        };
        group.add(new THREE.Mesh(geometry,material));
      });
      dispose(gltf.scene);
      setState(group.children.length ? '' : 'Brain geometry is unavailable.');
    }, undefined, () => { if(!disposed) setState('Could not load the brain model. Refresh to retry.'); });
    const resize = new ResizeObserver(() => { const w=container.clientWidth,h=container.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/Math.max(h,1); camera.updateProjectionMatrix(); });
    resize.observe(container);
    let visible=true;
    const observer=new IntersectionObserver(entries => { visible=entries[0].isIntersecting; }); observer.observe(container);
    renderer.setAnimationLoop(() => { if(visible) { controls.update(); renderer.render(scene,camera); } });
    return () => { disposed=true; observer.disconnect(); resize.disconnect(); renderer.setAnimationLoop(null); controls.dispose(); dispose(group); renderer.dispose(); renderer.domElement.remove(); viewer.current=null; };
  }, []);
  useEffect(() => { if(viewer.current) { viewer.current.uniforms.uTime.value=time; viewer.current.uniforms.uPreview.value=preview ? 1:0; } }, [time,preview]);
  useEffect(() => { if(!viewer.current) return; const {camera,controls}=viewer.current; camera.position.set(...(view === 'Superior' ? [0,4.4,.01] : view === 'Anterior' ? [0,.25,4.4] : [3.4,.65,2.4]) as [number,number,number]); controls.target.set(0,0,0); controls.update(); }, [view,reset]);
  return <div className="cortex-canvas" ref={host} role="img" aria-label={preview ? 'Rotatable anatomical brain with illustrative blue overlay, not measured or predicted fMRI data' : 'Rotatable anatomical brain; fMRI predictions not connected'}><span className="brain-status" hidden={!state}>{state}</span></div>;
}
