<script>
	import { trocarEstadoDoJogo } from './Estado.js'
    let estadoAtual = 0;
</script>
<head> 
    <link rel="stylesheet" href="/css/menu.css">
</head>

<h1 class='h1menu'>Minos</h1>
<p class='pmenu'>Labyrinth</p>   

{#if (estadoAtual == 0)}

<div class="divapp">
    <ul class="ulapp"><button  class="buttonapp" on:click={() => {trocarEstadoDoJogo('jogar')}}><p class="pmenu">Novo jogo</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('sobre')}><p class="pmenu">Sobre</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('ajuda')}><p class="pmenu">Ajuda</p></button></ul>
</div>

{:else if (estadoAtual == 1)}
<div class="divapp">
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('jogar')}><p class="pmenu">Continuar</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => {trocarEstadoDoJogo('jogar')}}><p class="pmenu">Novo jogo</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('sobre')}><p class="pmenu">Sobre</p></button></ul>
    <ul class="ulapp"><button  class="buttonapp" on:click={() => trocarEstadoDoJogo('ajuda')}><p class="pmenu">Ajuda</p></button></ul>
</div>

{/if}