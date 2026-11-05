from pathlib import Path
import math, random, base64
O=Path(__file__).parent
font=base64.b64encode(Path('frontend/node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2').read_bytes()).decode()
TAU=math.tau;DURATION=32;SAMPLES=44
FRAMES=257
times=[i*DURATION/(FRAMES-1) for i in range(FRAMES)]
keys=';'.join(f'{t/DURATION:.7f}' for t in times)
def state(time):
    a=int(time/8)%4
    m=max(0,min(1,((time%8)-4)/4))
    m=m*m*m*(m*(m*6-15)+10)
    return a,(a+1)%4,m

def mix(p,q,m):return tuple(x*(1-m)+y*m for x,y in zip(p,q))
def scalar(values,time):
    a,b,m=state(time);return values[a]*(1-m)+values[b]*m

def shape(phase,u,v,time):
    t=v*TAU;a=u*TAU;w=time*TAU/4
    if phase==0:
        side=-1 if u<.5 else 1;q=u*2%1
        fold=1+.13*math.sin(3*t+q*TAU-w)+.055*math.sin(6*t+w*2)
        torsion=q*TAU+.32*math.sin(t*2-w)
        return (side*(106+120*math.cos(t)*fold)+12*math.sin(t*2-w),166*math.sin(t)*(.83+.17*math.cos(torsion))*(1+.065*math.sin(w/2+a)),95*math.sin(torsion)*math.sin(t)+24*math.sin(t*3-w))
    if phase==1:
        r=235*(v-.5)*2
        wave=21*math.sin(t*3-w+a)+9*math.sin(t*7-w*2+a)
        angle=a+.62*math.sin((v-.5)*math.pi)+.10*math.sin(w/2+t)
        return (r*math.cos(angle)+wave*math.sin(a),r*.72*math.sin(angle)+wave*math.cos(a),68*math.sin(t+a-w/2)+wave)
    if phase==2:
        r=132+34*math.cos(3*t+a-w/2)+16*math.sin(a*3+w)
        return (r*math.cos(t)+50*math.cos(a-w/2),r*.82*math.sin(t)+27*math.sin(a+w),92*math.sin(a+t*2-w/2)+20*math.sin(t*5+w))
    radius=1+.06*math.sin(3*t-w+a)
    return (222*math.cos(t)*radius,148*math.sin(t)*math.cos(a+.15*math.sin(w/2+t))*radius,148*math.sin(t)*math.sin(a+.15*math.sin(w/2+t))+13*math.sin(t*4-w))

def project(p,time):
    x,y,z=p;yaw=TAU*time/16+.3;pitch=.28+.22*math.sin(TAU*time/32);roll=-.10+.13*math.sin(TAU*time/16)
    x,z=x*math.cos(yaw)+z*math.sin(yaw),-x*math.sin(yaw)+z*math.cos(yaw)
    y,z=y*math.cos(pitch)-z*math.sin(pitch),y*math.sin(pitch)+z*math.cos(pitch)
    x,y=x*math.cos(roll)-y*math.sin(roll),x*math.sin(roll)+y*math.cos(roll)
    scale=1+z/1600
    return 480+x*scale,320+y*scale,z

def point(u,v,time,travel=False):
    a,b,m=state(time)
    def coordinates(phase):
        vv=((1-math.cos(TAU*(v+time/8)))/2 if phase==1 else (v+time/8)%1) if travel else v
        return shape(phase,u,vv,time)
    return project(mix(coordinates(a),coordinates(b),m),time)

def path(u,time):
    a,b,m=state(time)
    def coordinates(phase,v):
        # A strand contracts into its own solid point in the particle phase.
        # The same coordinates expand into the next orbit: no opacity change.
        if phase==2:v=(u*.618+time/8)%1
        return shape(phase,u,v,time)
    ps=[project(mix(coordinates(a,j/SAMPLES),coordinates(b,j/SAMPLES),m),time) for j in range(SAMPLES+1)]
    d=f'M{ps[0][0]:.1f},{ps[0][1]:.1f}'
    for j in range(1,len(ps)-1):
        x,y,_=ps[j];xx,yy,_=ps[j+1]
        d+=f' Q{x:.1f},{y:.1f} {(x+xx)/2:.1f},{(y+yy)/2:.1f}'
    return d+f' L{ps[-1][0]:.1f},{ps[-1][1]:.1f}'

def animate(attr,values):
    values[-1]=values[0]
    return f'<animate attributeName="{attr}" values="{";".join(values)}" keyTimes="{keys}" dur="32s" repeatCount="indefinite"/>'

out=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="135 55 690 530" fill="none" role="img" aria-labelledby="title desc">','<title id="title">Neural Bloom — solid white living morph</title><desc id="desc">Fully opaque white neural fibers, traveling EEG-inspired waves, flowing particles and changing numbers in every phase. The living geometry continuously rotates and smoothly morphs through a 32-second loop. Transparent background. Illustrative data.</desc>',f'<defs><style>@font-face{{font-family:Geist Mono;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:100 900}}text{{font-family:Geist Mono,monospace;font-weight:400;font-variant-numeric:tabular-nums}}</style></defs>','<g stroke="#FFFFFF" fill="none" stroke-linecap="round" stroke-linejoin="round">']
for i in range(22):
    ds=[path(i/22,t) for t in times]
    widths=[f'{scalar([1.5,1.75,3.1,1.4],t):.2f}' for t in times]
    out.append(f'<path stroke-width="{widths[0]}" d="{ds[0]}">'+animate('d',ds)+animate('stroke-width',widths)+'</path>')
    if i%5==0:
        out.append(f'<path stroke-width="2.6" stroke-dasharray="24 1400" d="{ds[0]}">'+animate('d',ds)+f'<animate attributeName="stroke-dashoffset" from="1424" to="0" dur="4s" begin="-{i/8}s" repeatCount="indefinite"/></path>')
out.append('</g><g fill="#FFFFFF">')
random.seed(17)
for i in range(120):
    u=random.random();v=random.random();size=random.uniform(.8,1.2)
    ps=[point(u,v,t,travel=True) for t in times]
    xs=[f'{p[0]:.1f}' for p in ps];ys=[f'{p[1]:.1f}' for p in ps]
    rs=[f'{size*scalar([1.3,1.4,2.5,1.2],t)*(1+p[2]/1800):.2f}' for p,t in zip(ps,times)]
    out.append(f'<circle cx="{xs[0]}" cy="{ys[0]}" r="{rs[0]}">'+animate('cx',xs)+animate('cy',ys)+animate('r',rs)+'</circle>')
for i in range(13):
    u=(i*.61803398875)%1;v=(i*.381966+.12)%1
    ps=[point(u,v+.025*math.sin(TAU*t/8+i),t) for t in times]
    translations=[f'{480+(p[0]-480)*1.08+7:.1f} {320+(p[1]-320)*1.08-7:.1f}' for p in ps];translations[-1]=translations[0]
    out.append(f'<g font-size="13" transform="translate({translations[0]})"><animateTransform attributeName="transform" type="translate" values="{";".join(translations)}" keyTimes="{keys}" dur="32s" repeatCount="indefinite"/>')
    for k in range(8):
        val=f'{random.uniform(12,960):06.2f}'
        visibility=['visible' if j%8==k else 'hidden' for j in range(9)]
        out.append(f'<text visibility="{visibility[0]}">{val}<animate attributeName="visibility" values="{";".join(visibility)}" dur="4s" begin="-{i*.125}s" calcMode="discrete" repeatCount="indefinite"/></text>')
    out.append('</g>')
out.append('</g></svg>')
(O/'neural-bloom.svg').write_text('\n'.join(out))
print('SVG bytes:',(O/'neural-bloom.svg').stat().st_size)
