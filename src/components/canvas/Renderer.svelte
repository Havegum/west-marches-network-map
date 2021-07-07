<script>
import { quadtree } from 'd3-quadtree';

export let nodes = [];
export let links = [];
let width = 100;
let height = 100;

export let color = () => 'black';
export let useBrowser = false;


const background = '#2f3437';
const tau = 2 * Math.PI;

$: w = width / 2;
$: h = height / 2;

$: tree = quadtree(nodes, n => n.x, n => n.y);

let hover;
let timeout;
let contexts = {};
$: if (contexts.base && timeout === undefined) draw(links, nodes, width, height, hover);

$: resizeTimeout(width, height); 

function resizeTimeout () {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    timeout = clearTimeout(timeout)
  }, 100);
}

function draw (links, nodes, width, height, hover) {
  drawTop(hover);
  const ctx = contexts.base;
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
    const r = 3 + Math.log(n.degree + 1) * 1.5;
    ctx.beginPath();
    ctx.fillStyle = color(n.type);
    ctx.ellipse(x + w, y + h, r, r, 0, 0, tau);
    ctx.fill();
  }

  ctx.lineWidth = 4;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    let { x, y } = n;

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = "#FFF9";
    ctx.strokeStyle = background + 'aa';
    const { width: textWidth } = ctx.measureText(n.name);
    x = x + w - textWidth / 2;
    y = y + h + 16;
    ctx.strokeText(n.name, x, y);
    ctx.fillText(n.name, x, y);
  }
}

function drawTop (hover) {
  const ctx = contexts.top;
  ctx.clearRect(0, 0, width, height);
  if (!hover) return 
  
  let { x, y } = hover;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const n = hover;
  const r = 15 + Math.log(n.degree + 1) * 1.5;
  ctx.beginPath();
  ctx.fillStyle = color(n.type) + '33';
  ctx.ellipse(x + w, y + h, r, r, 0, 0, tau);
  ctx.fill();

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = background + 'ff';
  ctx.lineWidth = 6;
  const { width: textWidth } = ctx.measureText(hover.name);
  x = x + w - textWidth / 2;
  y = y + h + 16;
  ctx.strokeText(hover.name, x, y);
  ctx.fillText(hover.name, x, y);
}

function context (canvas, scope) {
  contexts[scope] = canvas.getContext('2d');
}

function handlePointerIn (e) {
}

function handlePointerOut (e) {
  hover = undefined;
}

function handlePointerMove (e) {
  const { clientX: x, clientY: y } = e;
  const top = e.target.parentNode.offsetTop;
  hover = tree.find(x - w, (y - top) - h, 60);
}

function handlePointerDown (e) {
  const { clientX: x, clientY: y } = e;
  hover = tree.find(x - w, y - h, 60);
  let id = hover?.id;
  if (!id) return;
  id = id.replace(/[^a-z0-9]/gi, '');
  const protocol = useBrowser ? 'https' : 'notion';
  let newWindow = window.open(`${protocol}://www.notion.so/${id}`, '_self', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}
</script>


<div class="renderer" bind:clientWidth={width} bind:clientHeight={height}>

  <canvas
    class="base"
    on:pointerover={handlePointerIn}
    on:pointerleave={handlePointerOut}
    on:pointermove={handlePointerMove}
    on:pointerdown={handlePointerDown}
    use:context={'base'}
    class:clickable={hover !== undefined}
    {width}
    {height}
  />

  <canvas
    {width}
    {height}
    class="top" use:context={'top'}
  />
</div>


<style>
.renderer {
  position: relative;
  height: 100%;
}

canvas {
	display: block;
	margin: 0;
	padding: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.top, .debug {
  pointer-events: none;
  z-index: 4;
}

/* .base {
  opacity: 0;
} */

.clickable {
  cursor: pointer;
}
</style>