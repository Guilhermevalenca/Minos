 <script>
	import { trocarEstadoDoJogo } from './Estado.js'
</script>
<head> 
    <link rel="stylesheet" href="/css/menu.css">
</head>

<h1 class='h1menu'>Minos</h1>
<p class='pmenu'>Labyrinth</p>   


<div class="divapp">
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('jogar')}><p class="pmenu">Jogar</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('ajuda')}><p class="pmenu">Como jogar</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('sobre')}><p class="pmenu">Sobre</p></button></ul>
    <ul class="ulapp"><button class="buttonapp" on:click={() => trocarEstadoDoJogo('creditos')}><p class="pmenu">Créditos</p></button></ul>
</div>
