import SimulationView from '../../simulation';
export function generateStaticParams() {
  return [{ simulation:'industrial-revolution' }, { simulation:'cold-war' }];
}
export default async function Page({ params }: { params: Promise<{ simulation:string }> }) {
  const { simulation } = await params;
  return <SimulationView id={simulation} />;
}
