 <script>
	import Ajuda from './ajuda.svelte';
	import Menu from './menu.svelte';
	import Sobre from './sobre.svelte';
	import {estado} from './Estado.js';
	import NewJogo from './newjogo.svelte';
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
