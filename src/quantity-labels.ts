import type {Variable} from './semantics';

export function numericalText(value:number) {
  const text=String(value);
  const scientific=text.match(/^(.+)e([+-]?\d+)$/);
  return scientific ? `${scientific[1]}\\times 10^{${Number(scientific[2])}}` : text;
}
export function unitLatex(unit:string) {
  if(unit==='1')return ''; // Dimensionless quantities have no physical unit.
  if(unit==='°')return '^\\circ';
  return unit.split('/').map(part=>{
    const [base,power]=part.split('^');
    return `\\mathrm{${base}}${power?`^{${power}}`:''}`;
  }).join('/');
}
/** Only authored/stored numbers are definitions; geometry and expressions are not. */
export function numericalLabel(symbol:string,value?:number,unit='') {
  return value===undefined ? symbol : `${symbol}=${numericalText(value)}${unit && unit!=='1' ? (unit==='°'?'':'\\,')+unitLatex(unit) : ''}`;
}
export function quantityLabel(variable:Variable|undefined,symbol=variable?.symbol||'') {
  return numericalLabel(symbol,variable?.state==='known' ? variable.value : undefined,variable?.unit);
}
