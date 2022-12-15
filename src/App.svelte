<script>
	import {Router, Route, Link} from 'svelte-navigator'
	import Ajuda from './ajuda.svelte'
	import Menu from './menu.svelte'
	import Sobre from './sobre.svelte'
	import Jogar from './jogo.svelte'
	import {estado} from './Estado.js'
</script>

<head>
	<link rel="stylesheet" href="/css/appsvelte.css">
</head>

{#if $estado === 'menu'}
	<Menu/>
{:else if $estado === 'jogar'}
	<Jogar/>
{:else if $estado === 'sobre'}
	<Sobre/>
{:else if $estado ==='ajuda'}
	<Ajuda/>
{/if}

