 <script>
	import {Router, Route, Link} from 'svelte-navigator'
	import Ajuda from './ajuda.svelte'
	import Menu from './menu.svelte'
	import Sobre from './sobre.svelte'
	import Jogar from './jogo.svelte'
	import {estado} from './Estado.js'
	import Teste from './teste.svelte'
  	import Newjogo from './newjogo.svelte';
    import Creditos from './creditos.svelte';
</script>


<head>
	<link rel="stylesheet" href="/css/appsvelte.css">
</head>

{#if $estado === 'menu'}
	<Menu/>
{:else if $estado === 'jogar'}
	<Newjogo/>
{:else if $estado === 'sobre'}
	<Sobre/>
{:else if $estado ==='ajuda'}
	<Ajuda/>
{:else if $estado === 'creditos'}
	<Creditos/>
{/if} 


<!--
<audio src="/css/audio.mp3" autoplay preload="auto"></audio>

<div>
	<audio id="audio" autoplay loop>
		<source src="/css/audio3.wav" type="audio/wav">
		<source src="/css/audio2.ogg" type="audio/ogg">
	</audio>
</div> 
-->
