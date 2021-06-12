<script>
import { quadtree } from 'd3-quadtree';

export let nodes = [];
export let links = [];
export let width = 100;
export let height = 100;
export let color = () => 'black';

const background = '#2f3437';

$: w = width / 2;
$: h = height / 2;

$: tree = quadtree(nodes, n => n.x, n => n.y);
let hover;

let ctx, timeout;
$: if (ctx && timeout === undefined) draw(links, nodes, width, height, hover);

$: resizeTimeout(width, height); 

function resizeTimeout (w, h) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    timeout = clearTimeout(timeout)
  }, 100);
}

const tau = 2 * Math.PI;

function draw (links, nodes, width, height, hover) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.fillStyle = background + '88';
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    const { x: x1, y: y1 } = l.source;
    const { x: x2, y: y2 } = l.target;

    ctx.beginPath();
    ctx.strokeStyle = "#ffffff15";
    ctx.moveTo(x1 + w, y1 + h);
    ctx.lineTo(x2 + w, y2 + h);
    ctx.stroke();
  }

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const { x, y } = n;
    const r = 4 + Math.log(n.degree + 1) * 2.5;
    ctx.beginPath();
    ctx.fillStyle = color(n.type);
    ctx.ellipse(x + w, y + h, r, r, 0, 0, tau);
    
    ctx.fill();
    if (hover === n.id) {
      ctx.strokeStyle = color(n.type) + '33';
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  ctx.lineWidth = 4;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    let { x, y } = n;

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = "#FFF9";
    if (hover === n.id) ctx.fillStyle = "#FFF";
    ctx.strokeStyle = background + 'aa';
    const { width: textWidth } = ctx.measureText(n.name);
    x = x + w - textWidth / 2;
    y = y + h + 16;
    ctx.strokeText(n.name, x, y);
    ctx.fillText(n.name, x, y);
  }
}

function context (canvas) {
  ctx = canvas.getContext('2d');
}

function handlePointerIn (e) {
  console.log(e);
}

function handlePointerOut (e) {
  console.log(e);
  hover = undefined;
}

function handlePointerMove (e) {
  const { clientX: x, clientY: y } = e;
  hover = tree.find(x - w, y - h, 60)?.id;
}

function handlePointerDown (e) {
  const id = hover;
  if (!id) return;
  window.open(`https://www.notion.so/${id.replace(/[^a-z0-9]/gi, '')}`, '_blank');
}
</script>


<canvas
  on:pointerover={handlePointerIn}
  on:pointerleave={handlePointerOut}
  on:pointermove={handlePointerMove}
  on:pointerdown={handlePointerDown}
  use:context
  class:clickable={hover !== undefined}
  {width}
  {height}
/>


<style>
canvas {
	display: block;
	margin: 0;
	padding: 0;
}

.clickable {
  cursor: pointer;
}
</style>