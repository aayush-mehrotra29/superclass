'use client';

import { useEffect, useRef } from 'react';

const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision mediump float;
varying vec2 uv;
uniform float time;
uniform float aspect;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float f=0.,a=.5;mat2 m=mat2(.8,-.6,.6,.8);for(int i=0;i<6;i++){f+=a*noise(p);p=m*p*2.04+7.3;a*=.5;}return f;}
void main(){
 vec2 p=vec2(uv.x*aspect,uv.y)*3.15;
 vec2 wind=vec2(time*.024,time*.008);
 float a=fbm(p+wind);
 float b=fbm(p*1.35+vec2(8.1,2.8)+wind*.6);
 float billow=fbm(p+vec2(a,b)*2.1+wind);
 float cloud=smoothstep(.31,.75,billow*.77+a*.23);
 float detail=fbm(p*2.1+wind+vec2(1.7,3.2));
 vec3 sky=mix(vec3(.24,.64,.94),vec3(.47,.79,.98),uv.y);
 vec3 white=mix(vec3(.69,.85,.96),vec3(.96,.98,1.),detail);
 vec3 color=mix(sky,white,cloud*.94);
 color+=.055*pow(cloud,3.);
 gl_FragColor=vec4(color,1.);
}`;

export default function CloudField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const gl = node.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) { if (vs) gl.deleteShader(vs); if (fs) gl.deleteShader(fs); return; }
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const timeLocation = gl.getUniformLocation(program, 'time'), aspectLocation = gl.getUniformLocation(program, 'aspect');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true, frame = 0, last = 0;
    const start = performance.now();
    const draw = (stamp: number) => {
      gl.uniform1f(timeLocation, reduced.matches ? 0 : (stamp - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const resize = () => {
      const rect = node.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      node.width = Math.max(1, Math.round(rect.width * ratio));
      node.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, node.width, node.height);
      gl.uniform1f(aspectLocation, node.width / node.height); draw(performance.now());
    };
    const tick = (stamp: number) => {
      if (visible && !document.hidden && !reduced.matches && stamp - last >= 33) { draw(stamp); last = stamp; }
      frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(resize); observer.observe(node);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); intersection.observe(node);
    resize(); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); };
  }, []);
  return <canvas ref={canvas} className="cloud-canvas" aria-hidden="true" />;
}
