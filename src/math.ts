import katex from 'katex';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
const cache = new Map<string, Promise<HTMLImageElement>>();
export function renderMath(source: string, fontSize: number): Promise<HTMLImageElement> {
  const key = JSON.stringify([source, fontSize]);
  if (!cache.has(key)) {
    const promise = (async () => {
      const host = document.createElement('div');
      Object.assign(host.style, { position: 'absolute', left: '-10000px', top: '0', display: 'inline-block', fontSize: `${fontSize}px`, background: 'transparent' });
      host.innerHTML = katex.renderToString(source, { throwOnError: false, output: 'html', trust: false, maxExpand: 1000 });
      document.body.appendChild(host);
      try {
        await document.fonts.ready;
        const canvas = await html2canvas(host, { backgroundColor: null, scale: 2, logging: false });
        const image = new Image();
        image.src = canvas.toDataURL();
        await image.decode();
        return image;
      } finally { host.remove(); }
    })();
    cache.set(key, promise);
    promise.catch(() => cache.delete(key));
  }
  return cache.get(key)!;
}
