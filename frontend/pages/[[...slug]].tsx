import dynamic from 'next/dynamic';

const SpaRoot = dynamic(() => import('../src/spa-root'), {
  ssr: false,
});

export default function CatchAllPage() {
  return <SpaRoot />;
}
