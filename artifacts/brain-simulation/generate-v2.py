from pathlib import Path
import math, random, base64
O=Path(__file__).parent
FONT=Path('frontend/node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')
font=base64.b64encode(FONT.read_bytes()).decode()
TAU=math.tau; N=26; SAMPLES=56; FRAMES=145; DURATION=48
# Each phase holds for six seconds, then smoothly morphs into the next.
def state(time):
    pos=time/12; a=int(pos)%4; f=pos%1
    m=max(0,min(1,(f-.50)/.50));m=m*m*(3-2*m)
    return a,(a+1)%4,m

def shape(phase,u,v):
    t=v*TAU; a=u*TAU
    if phase==0: # folded bilateral neural fibers
        side=-1 if u<.5 else 1
        q=(u*2)%1
        fold=1+.12*math.sin(3*t+q*TAU)
        return (side*(112+124*math.cos(t)*fold),176*math.sin(t)*(.72+.28*math.cos(q*math.pi)),88*math.sin(q*TAU)*math.sin(t)+30*math.sin(t*2+q*TAU))
    if phase==1: # radial signal tracts with EEG-like oscillations
        r=245*(v-.5)*2
        wave=(math.sin(t*4+a*2)+.45*math.sin(t*9-a))*13
        angle=a+.70*math.sin((v-.5)*math.pi)
        return (r*math.cos(angle),r*.72*math.sin(angle),75*math.sin(t+a)+wave)
    if phase==2: # a twisted particle cloud / double spiral surface
        r=140+48*math.cos(3*t+a)
        return (r*math.cos(t)+55*math.cos(a),r*.76*math.sin(t)+35*math.sin(a),100*math.sin(a+t*2))
    # sparse oblique orbital paths, surrounded by values
    return (235*math.cos(t),154*math.sin(t)*math.cos(a),154*math.sin(t)*math.sin(a))

def point(u,v,time):
    a,b,m=state(time);p=shape(a,u,v);q=shape(b,u,v)
    x,y,z=[p[k]*(1-m)+q[k]*m for k in range(3)]
    # True 3D rotation with tilt; two complete turns per seamless 48-second loop.
    yaw=TAU*2*time/DURATION+.3
    pitch=.28+.25*math.sin(TAU*time/DURATION)
    roll=-.10+.15*math.sin(TAU*time/DURATION)
    x,z=x*math.cos(yaw)+z*math.sin(yaw),-x*math.sin(yaw)+z*math.cos(yaw)
    y,z=y*math.cos(pitch)-z*math.sin(pitch),y*math.sin(pitch)+z*math.cos(pitch)
    x,y=x*math.cos(roll)-y*math.sin(roll),x*math.sin(roll)+y*math.cos(roll)
    scale=1+z/1400
    return 480+x*scale,320+y*scale,z

times=[i*DURATION/(FRAMES-1) for i in range(FRAMES)]
def blend(vals,t):
    a,b,m=state(t);return vals[a]*(1-m)+vals[b]*m

def anim(attr,values):
    return f'<animate attributeName="{attr}" values="{";".join(values)}" dur="48s" repeatCount="indefinite" calcMode="linear"/>'
def path(u,t):
    pts=[point(u,j/SAMPLES,t) for j in range(SAMPLES+1)]
    d=f'M{pts[0][0]:.1f},{pts[0][1]:.1f}'
    for j in range(1,len(pts)-1):
        x,y,_=pts[j];nx,ny,_=pts[j+1]
        d+=f' Q{x:.1f},{y:.1f} {(x+nx)/2:.1f},{(y+ny)/2:.1f}'
    d+=f' L{pts[-1][0]:.1f},{pts[-1][1]:.1f}'
    return d

def colored(group):
    # White stays white. Each other group follows the phase's restricted palette.
    colors=[['#FFFFFF']*4,['#CDB3FF','#FFB578','#F89BCB','#CDB3FF'],['#F8B5D6','#FFB578','#FFE6A0','#CDB3FF']][group]
    vals=[]
    for t in times:
        a,b,m=state(t);ca=colors[a];cb=colors[b]
        rgb=[round(int(ca[k:k+2],16)*(1-m)+int(cb[k:k+2],16)*m) for k in (1,3,5)]
        vals.append('#'+''.join(f'{x:02x}' for x in rgb))
    return vals

out=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="140 65 680 510" fill="none" role="img" aria-labelledby="title desc">','<title id="title">Neural Bloom — continuous rotating simulation</title><desc id="desc">A transparent 48-second loop morphing rotating neural fibers into three-dimensional EEG-inspired waves, particles, and numerical orbits. White with one or two warm accent colors per phase. Illustrative data.</desc>',f'<defs><style>@font-face{{font-family:Geist Mono;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:100 900}}text{{font-family:Geist Mono,monospace;font-weight:400;font-variant-numeric:tabular-nums}}</style></defs>']
# All geometry uses the same moving 3D field. It morphs, rather than swapping scenes.
for g in range(3):
    out.append(f'<g stroke="{colored(g)[0]}" stroke-linecap="round" stroke-linejoin="round">'+anim('stroke',colored(g)))
    for i in range(N):
        grp=0 if i%5<3 else (1 if i%5==3 else 2)
        if grp!=g:continue
        u=i/N;ds=[path(u,t) for t in times]
        opacity=[f'{blend([.60,.64,.025,.46 if i%3==0 else .035],t):.3f}' for t in times]
        width=[f'{blend([1.45,1.8,.8,1.35],t):.2f}' for t in times]
        out.append(f'<path d="{ds[0]}" opacity="{opacity[0]}" stroke-width="{width[0]}">'+anim('d',ds)+anim('opacity',opacity)+anim('stroke-width',width)+'</path>')
    out.append('</g>')
# Fewer, larger points remain legible when the SVG is reduced.
random.seed(17)
particles=[(random.random(),random.random(),random.uniform(.7,1.25)) for _ in range(168)]
for g in range(3):
    out.append(f'<g fill="{colored(g)[0]}">'+anim('fill',colored(g)))
    for i,(u,v,size) in enumerate(particles):
        grp=0 if i%5<3 else (1 if i%5==3 else 2)
        if grp!=g:continue
        ps=[point(u,v,t) for t in times]
        # A stable point correspondence prevents jumps while the shapes morph.
        xs=[f'{p[0]:.1f}' for p in ps];ys=[f'{p[1]:.1f}' for p in ps]
        rs=[f'{size*blend([1.4,1.5,2.8,1.55],t)*(1+p[2]/1200):.2f}' for t,p in zip(times,ps)]
        os=[f'{blend([.35,.4,.90,.38],t)*(.72+.28*(p[2]+250)/500):.3f}' for t,p in zip(times,ps)]
        out.append(f'<circle cx="{xs[0]}" cy="{ys[0]}" r="{rs[0]}" opacity="{os[0]}">'+anim('cx',xs)+anim('cy',ys)+anim('r',rs)+anim('opacity',os)+'</circle>')
    out.append('</g>')
# Upright readable values attached to the rotating volume; numerals reconfigure in the value phase.
for i in range(13):
    u=(i*.61803398875)%1;v=(i*.381966+.12)%1
    ps=[point(u,v,t) for t in times]
    xs=[f'{480+(p[0]-480)*1.08+7:.1f}' for p in ps];ys=[f'{320+(p[1]-320)*1.08-7:.1f}' for p in ps]
    os=[f'{blend([.72,.78,0,.95],t)*(.3+.7*(p[2]+250)/500):.3f}' for t,p in zip(times,ps)]
    value=f'{random.uniform(12,960):06.2f}'
    out.append(f'<text x="{xs[0]}" y="{ys[0]}" fill="#FFFFFF" font-size="13" opacity="{os[0]}">{value}'+anim('x',xs)+anim('y',ys)+anim('opacity',os)+'</text>')
out.append('</svg>')
(O/'neural-bloom.svg').write_text('\n'.join(out))
print('SVG bytes:',(O/'neural-bloom.svg').stat().st_size)
