<script>
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCenter } from 'd3-force';
import { scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { nodes as parsedNodes, links as parsedLinks } from './data.js';

import SvgRenderer from '@/components/svg/Renderer.svelte';
import CanvasRenderer from '@/components/canvas/Renderer.svelte';

let types = [...parsedNodes.reduce((set, next) => set.add(next.type), new Set()).values()];
const c = scaleOrdinal(types, schemeCategory10);

let visible = Object.fromEntries(types.map(type => [type, true]));

let initSize = false;
let width = 100;
let height = 100;
$: size = Math.min(width, height);

let n = [], nodes = parsedNodes;
let l = [], links = parsedLinks;
$: nodes = parsedNodes.filter(d => visible[d.type]).map(fixSessions(size,));
$: links = parsedLinks.filter(l => visible[l.sourceType] && visible[l.targetType]);


const maxSession = max(parsedNodes, n => n.number) + 1;
function fixSessions (s) {
	const pi = Math.PI;
	const tau = pi * 2;
	const radius = s / 2.5;
	return function (node) {
		if (node.type === 'session') {
			const theta = (1 - node.number / maxSession) * tau - pi
			node.fx = Math.sin(theta) * radius;
			node.fy = Math.cos(theta) * radius;
		}
		return node;
	}
}

let initLinks = false;
const ifSession = (a, b) => d => d.type === 'session' ? a : b;

const linkForce = forceLink(l)
	.id(d => d.id)
	.strength(0.02);

$: {
	linkForce.links(links);
	if (!initLinks) {
		initLinks = true;
		simulation.tick(50);
	}
}

$: simulation.nodes(nodes).alpha(1).restart();
$: if (!initSize) {
	width, height;
	initSize = true;
	simulation.alpha(1).tick(30).alpha(0.5);
}

const simulation = forceSimulation(nodes)
	.force('link', linkForce)
	.force('charge', forceManyBody().distanceMax(300).strength(-20).theta(0))
	.force('gravity', forceManyBody().distanceMin(600).strength(20).theta(0.2))
	.force('center', forceCenter().strength(0.1))
	.force('y', forceY().strength(1e-4))
	.force('x', forceX().strength(1e-4))
	.alphaTarget(0)
	.alphaDecay(0.03)
	.velocityDecay(0.1)
	.restart();


simulation.on('tick', () => {
	n = simulation.nodes();
	l = simulation.force('link').links();
});
</script>


<div class="app" bind:clientWidth={width} bind:clientHeight={height}>
	<div class="controls">
		{#each types as type}
			<label class:visible={visible[type]} style="--c: {c(type)}">
				<input type="checkbox" bind:checked={visible[type]}/>
				{type}
			</label>
		{/each}
	</div>

	<h1>West Marches Network Map</h1>
	<CanvasRenderer nodes={n} links={l} color={c} {width} {height} />
	<!-- <SvgRenderer nodes={n} links={l} color={c} {width} {height} /> -->
</div>


<style>
.app {
	height: 100vh;
	width: 100vw;
	background-color: #2f3437;
}

.controls {
	position: absolute;
	left: 0;
	top: 0;
	z-index: 1;
	padding: 1em;
}

h1 {
	/* font-weight: normal; */
	color: rgba(255, 255, 255, 0.9);
	font-size: 32px;
	top: 8px;
	font-weight: 600;
	position: absolute;
	text-align: center;
	width: 100%;
}

.controls label {
	display: flex;
	align-items: center;
	color: rgba(255, 255, 255, 0.3);
	font-size: 14px;
	user-select: none;
	cursor: pointer;
	padding: .2em;
}

.controls label.visible {
	color: rgba(255, 255, 255, 0.6);
}

.controls label:hover {
	color: rgba(255, 255, 255, 0.9);
}

input {
	display: none;
}

.controls label::before {
	display: block;
	content: '';
	border-radius: 1em;
	background-color: rgba(255, 255, 255, 0.3);
	width: .75em;
	height: .75em;
	position: relative;
	margin-right: .45em;
	transform: translateY(1px);
}

.controls label.visible::before {
	background-color: var(--c);
}

.controls label:not(.visible):hover::before {
	background-color: rgba(255, 255, 255, 0.6);
}
</style>
