'use client';
const axes=[['attention_difficulty','ATTENTION','DIFFICULTY'],['interest_engagement','ENGAGEMENT',''],['comprehension_difficulty','COMPREHENSION','DIFFICULTY'],['confusion_risk','CONFUSION','RISK'],['mental_effort','MENTAL','EFFORT']];
export default function Radar({point}:{point?:{qualities:Record<string,{value:number|null}>}}){
 const xy=(i:number,r:number)=>[230+Math.cos(-Math.PI/2+i*2*Math.PI/5)*r,185+Math.sin(-Math.PI/2+i*2*Math.PI/5)*r];
 const values=axes.map(([k])=>point?.qualities[k]?.value??null);
 return <svg viewBox="0 0 460 380" className="neural-radar" role="img" aria-label={axes.map(([k,a,b],i)=>`${a} ${b}: ${values[i]?.toFixed(2)??'unavailable'}`).join('; ')}>
 {[2,4,6,8,10].map(n=><polygon key={n} points={axes.map((_,i)=>xy(i,n*12).join(',')).join(' ')} fill="none" stroke="#ccd6df"/>)}
 {axes.map((_,i)=><line key={i} x1="230" y1="185" x2={xy(i,120)[0]} y2={xy(i,120)[1]} stroke="#ccd6df"/>)}
 {values.every(v=>v!==null)&&<polygon points={values.map((v,i)=>xy(i,v!*12).join(',')).join(' ')} fill="#139eff" fillOpacity=".28" stroke="#0095ff" strokeWidth="3"/>}
 {[2,4,6,8,10].map(n=><text key={n} x="236" y={188-n*12} fill="#71869a" fontSize="9">{n}</text>)}
 {axes.map(([k,a,b],i)=>{const [x,y]=xy(i,160);return <g key={k}><text x={x} y={y-7} textAnchor="middle" className="radar-axis-label">{a}<tspan x={x} dy="13">{b}</tspan></text><text x={x} y={y+27} textAnchor="middle" className="radar-score">{values[i]?.toFixed(2)??'—'}</text></g>;})}
 </svg>;
}
