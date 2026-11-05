from pathlib import Path
import math, random, base64
O=Path(__file__).parent
font=base64.b64encode(Path('frontend/node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2').read_bytes()).decode()
TAU=math.tau;DURATION=32;SAMPLES=44
# Layers overlap for four seconds. Geometry remains independent and moving;
# nothing stretches or collapses into the next shape.
local_times=[i/8 for i in range(97)]+[32]
keys=';'.join(f'{s/32:.7f}' for s in local_times)

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

def point(phase,u,v,time):return project(shape(phase,u,v,time),time)
def path(phase,u,time):
    ps=[point(phase,u,j/SAMPLES,time) for j in range(SAMPLES+1)]
    d=f'M{ps[0][0]:.1f},{ps[0][1]:.1f}'
    for j in range(1,len(ps)-1):
        x,y,_=ps[j];xx,yy,_=ps[j+1]
        d+=f' Q{x:.1f},{y:.1f} {(x+xx)/2:.1f},{(y+yy)/2:.1f}'
    return d+f' L{ps[-1][0]:.1f},{ps[-1][1]:.1f}'

def animate(attr,values,begin):
    # Last value returns to the start while the layer is invisible.
    values[-1]=values[0]
    return f'<animate attributeName="{attr}" values="{";".join(values)}" keyTimes="{keys}" begin="{begin}s" dur="32s" repeatCount="indefinite"/>'

out=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="135 55 690 530" fill="none" role="img" aria-labelledby="title desc">','<title id="title">Neural Bloom — living white signal field</title><desc id="desc">Transparent white neural fibers, traveling EEG-inspired waves, flowing particles and changing numerical values. Independent living forms rotate and dissolve through a continuous 32-second loop. Illustrative data.</desc>',f'<defs><style>@font-face{{font-family:Geist Mono;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:100 900}}text{{font-family:Geist Mono,monospace;font-weight:400;font-variant-numeric:tabular-nums}}</style></defs>']
for phase in range(4):
    start=phase*8-2;begin=-((32-start)%32)
    times=[s+start for s in local_times]
    # Native easing, with no coordinate interpolation between phases.
    out.append(f'<g fill="#FFFFFF" stroke="#FFFFFF" opacity="0"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.125;.25;.375;1" keySplines=".42 0 .58 1;0 0 1 1;.42 0 .58 1;0 0 1 1" calcMode="spline" dur="32s" begin="{begin}s" repeatCount="indefinite"/>')
    n=[22,22,0,10][phase]
    for i in range(n):
        ds=[path(phase,i/n,t) for t in times]
        op=.38 if i%3 else .72
        out.append(f'<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="{1.6 if phase!=1 else 1.9}" opacity="{op}" d="{ds[0]}">'+animate('d',ds,begin)+'</path>')
        if i%4==0:
            # Highlights propagate along each bending fiber, independent of rotation.
            out.append(f'<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.1" opacity=".9" stroke-dasharray="24 1400" d="{ds[0]}">'+animate('d',ds,begin)+f'<animate attributeName="stroke-dashoffset" from="1424" to="0" dur="4s" begin="-{i/8}s" repeatCount="indefinite"/></path>')
    random.seed(17)
    count=[48,48,160,38][phase]
    for i in range(count):
        u=random.random();v=random.random();size=random.uniform(.8,1.2)
        ps=[]
        for t in times:
            # All paths use periodic travel. Open EEG strands turn smoothly at the ends.
            vv=(1-math.cos(TAU*(v+t/8)))/2 if phase==1 else (v+t/8)%1
            uu=u+.035*math.sin(TAU*t/4+i) if phase==2 else u
            ps.append(point(phase,uu,vv,t))
        xs=[f'{p[0]:.1f}' for p in ps];ys=[f'{p[1]:.1f}' for p in ps]
        rs=[f'{size*([1.8,1.8,2.7,1.5][phase])*(1+p[2]/1500):.2f}' for p in ps]
        os=[f'{(.55+.30*math.sin(TAU*t/4+i)**2)*(.7+.3*(p[2]+250)/500):.3f}' for p,t in zip(ps,times)]
        out.append(f'<circle stroke="none" cx="{xs[0]}" cy="{ys[0]}" r="{rs[0]}" opacity="{os[0]}">'+animate('cx',xs,begin)+animate('cy',ys,begin)+animate('r',rs,begin)+animate('opacity',os,begin)+'</circle>')
    for i in range([9,9,0,13][phase]):
        u=(i*.61803398875)%1;v=(i*.381966+.12)%1
        ps=[point(phase,u,v+.025*math.sin(TAU*t/8+i),t) for t in times]
        xs=[f'{480+(p[0]-480)*1.08+7:.1f}' for p in ps];ys=[f'{320+(p[1]-320)*1.08-7:.1f}' for p in ps]
        os=[f'{.4+.45*(p[2]+250)/500:.3f}' for p in ps]
        # Each value refreshes every half second, on an independent offset.
        translations=[f'{x} {y}' for x,y in zip(xs,ys)];translations[-1]=translations[0]
        out.append(f'<g stroke="none" font-size="13" transform="translate({translations[0]})"><animateTransform attributeName="transform" type="translate" values="{";".join(translations)}" keyTimes="{keys}" begin="{begin}s" dur="32s" repeatCount="indefinite"/>'+animate('opacity',os,begin))
        for k in range(8):
            val=f'{random.uniform(12,960):06.2f}'
            visibility=['1' if j%8==k else '0' for j in range(9)]
            out.append(f'<text opacity="{visibility[0]}">{val}'+f'<animate attributeName="opacity" values="{";".join(visibility)}" dur="4s" begin="-{i*.125}s" calcMode="discrete" repeatCount="indefinite"/></text>')
        out.append('</g>')
    out.append('</g>')
out.append('</svg>')
(O/'neural-bloom.svg').write_text('\n'.join(out))
print('SVG bytes:',(O/'neural-bloom.svg').stat().st_size)
