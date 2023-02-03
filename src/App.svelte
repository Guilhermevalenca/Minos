 <script>
	import {Router, Route, Link} from 'svelte-navigator'
	import Ajuda from './ajuda.svelte'
	import Menu from './menu.svelte'
	import Sobre from './sobre.svelte'
	import Jogar from './jogo(futil).svelte'
	import {estado} from './Estado.js'
	import NewJogo from './NewJogo.svelte'
  	import OldJogo from './OldJogo.svelte';
    import Creditos from './creditos.svelte';
</script>


<head>
	<link rel="stylesheet" href="/css/appsvelte.css">
	<link rel='icon'  href='/css/imagens/icone.png'>
</head>

{#if $estado === 'menu'}
	<Menu/>
{:else if $estado === 'jogar'}
	<NewJogo/>
{:else if $estado === 'sobre'}
	<Sobre/>
{:else if $estado ==='ajuda'}
	<Ajuda/>
{:else if $estado === 'creditos'}
	<Creditos/>
{/if}
