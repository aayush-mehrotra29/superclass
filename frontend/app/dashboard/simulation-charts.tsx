'use client';
export const responseNames = ['Attention','Engagement','Comprehension','Confusion','Mental effort'];
export function responseValues(time: number) { return [72+9*Math.sin(time/48), 59+10*Math.cos(time/57), 65+9*Math.sin(time/64), 26+8*Math.cos(time/43), 53+8*Math.sin(time/39)].map(Math.round); }
export function Radar({ time, demo }: { time:number; demo:boolean }) {
  const point = (i:number,r:number) => [150+Math.cos(-Math.PI/2+i*2*Math.PI/5)*r, 134+Math.sin(-Math.PI/2+i*2*Math.PI/5)*r];
  const values=responseValues(time);
  return <svg className="response-radar" viewBox="0 0 300 265" role="img" aria-label={demo ? 'Illustrative categorical response radar' : 'Response categories awaiting model output'}>
    {[.25,.5,.75,1].map(scale => <polygon key={scale} points={responseNames.map((_,i)=>point(i,84*scale).join(',')).join(' ')} fill="none" stroke="#e2e5e8" />)}
    {responseNames.map((label,i)=> { const [x,y]=point(i,84);const [tx,ty]=point(i,107); return <g key={label}><path d={`M150 134L${x} ${y}`} stroke="#e2e5e8"/><text x={tx} y={ty+3} textAnchor={i === 0 ? 'middle':i<3?'start':'end'}>{label === 'Comprehension' ? 'Understand' : label === 'Mental effort' ? 'Effort' : label}</text></g>; })}
    {demo && <polygon className="radar-shape" points={values.map((value,i)=>point(i,value*.84).join(',')).join(' ')} fill="#42b1ff" fillOpacity=".17" stroke="#42b1ff" strokeWidth="1.7" />}
    {!demo && <text x="150" y="137" textAnchor="middle" className="radar-empty">NO OUTPUT</text>}
  </svg>;
}
export function ResponseChart({ time, demo, metric, onTime }: {time:number;demo:boolean;metric:number;onTime:(time:number)=>void}) {
  const values=Array.from({length:61},(_,i)=>responseValues(i*5)[metric]);
  const points=values.map((value,i)=>`${46+i*11.6},${165-value*1.3}`);
  const x=46+time/300*696;
  return <svg className="response-chart" viewBox="0 0 780 205" role="img" aria-label={demo ? `Illustrative ${responseNames[metric]} over five minutes; use timeline slider to select a time` : 'Chart awaiting model output'}>
    {[0,25,50,75,100].map(value => <g key={value}><path d={`M46 ${165-value*1.3}H742`} stroke="#eceeef"/><text x="33" y={169-value*1.3} textAnchor="end">{value}</text></g>)}
    {[0,1,2,3,4,5].map(minute=><text key={minute} x={46+minute*139.2} y="190" textAnchor="middle">{minute}:00</text>)}
    {demo ? <><path d={`M${points.join(' L')}`} fill="none" stroke="#42b1ff" strokeWidth="2"/><path d={`M${x} 29V165`} stroke="#9aa6af" strokeDasharray="3 4"/><circle cx={x} cy={165-responseValues(time)[metric]*1.3} r="4" fill="#42b1ff"/>{values.map((_,i)=><rect key={i} x={40+i*11.6} y="29" width="12" height="136" fill="transparent" onClick={()=>onTime(i*5)}><title>{`${Math.floor(i*5/60)}:${String(i*5%60).padStart(2,'0')} — ${values[i]}`}</title></rect>)}</> : <text x="394" y="96" textAnchor="middle">Timeline data will appear here</text>}
  </svg>;
}
