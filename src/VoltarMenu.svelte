<script>
	import { trocarEstadoDoJogo } from './Estado.js'
</script>

<head>
	<link rel="stylesheet" href="/css/menu.css">
</head>

<ul class="ulapp"><button class="buttonapp" on:click={() => trocarEstadoDoJogo('menu')}><p class="pmenu">Voltar</p></button></ul>