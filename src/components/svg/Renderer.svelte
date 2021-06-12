<script>
import { expoOut } from 'svelte/easing';
import { draw } from 'svelte/transition';
export let nodes = [];
export let links = [];
export let width = 100;
export let height = 100;

export let color = () => 'black';
</script>



<svg {width} {height} viewBox="{-width / 2} {-height / 2} {width} {height}">
  {#each links as link (link.source.id + link.target.id)}
    <line
      class:weak={link.sourceType === 'session' ^ link.targetType === 'session'}
      in:draw={{ ease: expoOut, speed: .5, delay: Math.random() * 500 }}
      x1={link.source.x}
      y1={link.source.y}
      x2={link.target.x}
      y2={link.target.y}
    />
  {/each}
  
  <g>
    {#each nodes as node}
      <circle
        on:click={() => window.open(`https://www.notion.so/${node.id.replace(/[^a-z0-9]/gi, '')}`, '_blank')}
        cx={node.x}
        cy={node.y}
        r={4 + Math.log(node.degree + 1) * 2.5}
        style="--c: {color(node.type)}" />
    {/each}
  </g>

  <g class="labels">
    {#each nodes as node}
      <text x={node.x} y={node.y}>{node.name}</text>
    {/each}
  </g>
</svg>


<style>
svg {
	display: block;
	margin: 0;
	padding: 0;
	background-color: #e3e3e3;
}

line {
	stroke: #0003;
}

line.weak {
	opacity: .333;
}

circle {
	stroke: var(--c);
	stroke-width: 0px;
	stroke-opacity: .2;
	fill: var(--c);
	transition: stroke-width 200ms cubic-bezier(0.16, 1, 0.3, 1);
	cursor: pointer;
}

circle:hover {
	stroke-width: 20px;
}

.labels text {
	text-anchor: middle;
	font-size: 10px;
	fill: #666;
	transform: translateY(15px);
	stroke: #e3e3e3;
	paint-order: stroke;
	user-select:none;
	pointer-events: none
}
</style>