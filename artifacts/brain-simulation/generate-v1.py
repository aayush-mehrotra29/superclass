from pathlib import Path
import math, random, base64
random.seed(42)
OUT=Path(__file__).parent
FONT=Path('frontend/node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')
font=base64.b64encode(FONT.read_bytes()).decode()
W,H=1600,1000
palette=['#FFF0A3','#FFCF57','#FF9AD5','#F47ABC','#CFACFF','#A480ED','#FFAA71','#FF874B']
p=['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="1000" viewBox="0 0 1600 1000" fill="none" role="img" aria-labelledby="title desc">', '<title id="title">Neural Bloom — animated brain simulation</title><desc id="desc">An abstract two-lobed neural field with flowing white, yellow, pink, purple and orange fibers and illustrative numerical signals. Transparent background. Decorative simulation, not measured brain data.</desc>',f'<defs><style>@font-face{{font-family:Geist Mono;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:100 900}}text{{font-family:Geist Mono,monospace;font-weight:350;font-variant-numeric:tabular-nums}}@media(prefers-reduced-motion:reduce){{.moving{{display:none}}}}</style><radialGradient id="halo"><stop stop-color="#FFD8A2" stop-opacity=".14"/><stop offset="1" stop-color="#FF9AD5" stop-opacity="0"/></radialGradient><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>']
def emit(s):p.append(s)
def project(x,y,z):
    # Rotate a bilobed volume toward the viewer, with a slight diagonal tilt.
    a=.28;b=-.18
    xx=x*math.cos(a)+z*math.sin(a);zz=-x*math.sin(a)+z*math.cos(a)
    yy=y*math.cos(b)-zz*math.sin(b);zz=y*math.sin(b)+zz*math.cos(b)
    scale=1+zz/2200
    return (800+(xx*.985-yy*.14)*scale,490+(xx*.14+yy*.985)*scale,zz)
def fiber(side,index,phase=0):
    pts=[]
    u=index/39
    for j in range(65):
        t=j/64*math.pi*2
        # Winding surfaces form two interlaced cortical lobes with a central bridge.
        longitude=2*math.pi*u+.20*math.sin(t*3+u*5)+.025*math.sin(phase+t*2)
        r=1+.055*math.sin(5*t+longitude*3)+.025*math.sin(9*t-longitude)
        x=side*(238+248*math.cos(t)*r)
        y=330*math.sin(t)*(.88+.12*math.cos(longitude))
        z=190*math.sin(longitude)*math.sin(t)+48*math.cos(t*2+longitude)
        x+=34*math.sin(t*2+longitude)+8*math.sin(phase+t)
        y+=12*math.sin(longitude*3+t*2+phase)
        pts.append(project(x,y,z))
    return pts
def path(pts):
    return 'M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y,*_ in pts)
emit('<g stroke="#FFFFFF" stroke-width=".65" opacity=".17">')
# Sparse orbital coordinate cage, distinct from the source's concentric sphere.
for i in range(7):
    pts=[]
    for j in range(121):
        t=j/120*2*math.pi
        pts.append(project(650*math.cos(t),405*math.sin(t), (i-3)*65*math.sin(t)))
    emit(f'<path d="{path(pts)}" stroke-dasharray="2 13"/>')
emit('</g>')
# Long meandering input/output filaments frame the core.
for k in range(30):
    y=230+k*17
    c= '#FFFFFF' if k%4==0 else palette[k%len(palette)]
    d=f'M -80,{y} C 190,{y-190} 330,{720-k*7} 577,{510-k*2} C 800,{255+k*8} 970,{650-k*6} 1170,{410+k*3} C 1330,{200+k*14} 1490,{680-k*8} 1700,{350+k*13}'
    emit(f'<path id="stream{k}" d="{d}" stroke="{c}" stroke-width=".65" opacity=".17"/>')
    if k%3==0:
        emit(f'<path class="moving" d="{d}" stroke="{c}" stroke-width="1.1" stroke-dasharray="45 1900" opacity=".7"><animate attributeName="stroke-dashoffset" from="1900" to="-1900" dur="{18+k/3}s" repeatCount="indefinite"/></path>')
# Sort by depth so filaments behind the center recede.
fibers=[]
for side in [-1,1]:
    for i in range(40):
        pts=fiber(side,i)
        fibers.append((sum(v[2] for v in pts)/len(pts),side,i,pts))
for depth,side,i,pts in sorted(fibers):
    color='#FFFFFF' if i%5 in [0,1] else palette[(i+(0 if side==-1 else 3))%8]
    opacity=.40+(.4 if i%5==0 else .18)
    ident=f'f{"l" if side<0 else "r"}{i}'
    d=path(pts);d2=path(fiber(side,i,math.pi));d3=path(fiber(side,i,math.pi*2))
    emit(f'<path id="{ident}" d="{d}" stroke="{color}" stroke-width="{1.15 if i%5==0 else .7}" opacity="{opacity:.2f}" stroke-linecap="round"><animate attributeName="d" values="{d};{d2};{d}" dur="{12+i%7}s" repeatCount="indefinite"/></path>')
    if i%2==0:
        emit(f'<path class="moving" d="{d}" stroke="{color}" stroke-width="1.65" stroke-dasharray="26 2100" opacity=".95"><animate attributeName="stroke-dashoffset" from="2100" to="-2100" dur="{14+i%9}s" begin="-{i%13}s" repeatCount="indefinite"/><animate attributeName="d" values="{d};{d2};{d}" dur="{12+i%7}s" repeatCount="indefinite"/></path>')
# Nested folded tracts give the hemispheres internal depth.
for side in [-1,1]:
    for i in range(24):
        radius=.25+i/31
        pts=[]
        for j in range(81):
            t=j/80*2*math.pi
            fold=1+.14*math.sin(3*t+i*.12)+.055*math.sin(7*t-i*.2)
            x=side*(238+222*radius*math.cos(t)*fold)
            y=302*radius*math.sin(t)*fold
            z=100*math.sin(t*2+i*.12)+30*math.cos(t*3)
            pts.append(project(x,y,z))
        d=path(pts);col='#FFFFFF' if i%4==0 else palette[(i+2)%8]
        emit(f'<path d="{d}" stroke="{col}" stroke-width="{1.1 if i%4==0 else .75}" opacity="{.54 if i%4==0 else .44}"/>')
        if i%3==0:
            emit(f'<path class="moving" d="{d}" stroke="{col}" stroke-width="1.4" stroke-dasharray="35 2100" opacity=".9"><animate attributeName="stroke-dashoffset" from="2100" to="-2100" dur="{18+i%7}s" begin="-{i*.6}s" repeatCount="indefinite"/></path>')

# Corpus-like crossing bundles twist between the hemispheres.
for i in range(30):
    a=i/29; col='#FFFFFF' if i%6==0 else palette[i%8]
    d=f'M {360+a*105:.1f},{310+a*230:.1f} C {540+a*60:.1f},{130+a*310:.1f} {670+a*20:.1f},{745-a*450:.1f} 800,{480+(a-.5)*70:.1f} S {1030-a*40:.1f},{200+a*475:.1f} {1250-a*100:.1f},{410+a*180:.1f}'
    emit(f'<path d="{d}" stroke="{col}" stroke-width=".8" opacity=".53"/>')
    emit(f'<circle class="moving" r="{1.8 if i%4==0 else 1.1}" fill="{col}"><animateMotion path="{d}" dur="{7+i%6}s" begin="-{i*.47:.2f}s" repeatCount="indefinite"/></circle>')
# Telemetry samples distributed along the volume; white numerals, restrained colored markers.
for i in range(47):
    side=-1 if i%2==0 else 1
    idx=(i*13)%40;pts=fiber(side,idx)
    j=(i*17+6)%64;x,y,z=pts[j]
    if i<12: x,y,_=project(610*math.cos(i*.53),370*math.sin(i*.53),0)
    val=f'{random.uniform(10,980):06.2f}'
    col=palette[i%8]
    emit(f'<g transform="translate({x:.1f} {y:.1f})"><g><animateTransform attributeName="transform" type="translate" values="0 0;{(i%3-1)*7} {(i%5-2)*3};0 0" dur="{8+i%7}s" repeatCount="indefinite"/><rect x="-3" y="-3" width="3" height="3" fill="{col}"/><text x="5" y="-7" fill="#FFFFFF" font-size="{12 if z<0 else 14}" opacity="{.52 if z<0 else .88}">{val}</text>')
    if i%3==0:
        emit(f'<circle r="5" stroke="{col}" stroke-width=".65" opacity=".65"><animate attributeName="r" values="3;11;3" dur="{4+i%4}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0;.7" dur="{4+i%4}s" repeatCount="indefinite"/></circle>')
    emit('</g></g>')
# Peripheral binary motes.
for i in range(70):
    x=random.uniform(200,1400);y=random.uniform(170,840)
    if 610<x<990 and 340<y<650: continue
    emit(f'<text class="moving" x="{x:.1f}" y="{y:.1f}" fill="{("#FFFFFF" if i%3 else palette[i%8])}" opacity=".24" font-size="10">{i%2}<animate attributeName="opacity" values=".08;.45;.08" dur="{4+i%7}s" begin="-{i%5}s" repeatCount="indefinite"/></text>')
emit('</svg>')
(OUT/'neural-bloom.svg').write_text('\n'.join(p))
print('Created',OUT/'neural-bloom.svg', (OUT/'neural-bloom.svg').stat().st_size,'bytes')
