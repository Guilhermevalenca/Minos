<script>
    //imports fases do jogo:
    import Fase1 from './fases-do-jogo/nivel1.svelte'
    import Fase2 from './fases-do-jogo/nivel2.svelte'
    import Fase3 from './fases-do-jogo/nivel3.svelte'
    import {estado} from './Estado.js'
    import { trocarEstadoDoJogo } from './Estado.js'
    import VoltarMenu from './VoltarMenu.svelte'
    //utilizando função para controle do teclado:
    let key;
	let code;
	function handleKeydown(event) {
		key = event.key;
		code = event.code;
	}/*
    function movimentacao(){
        if(key){
            switch (code){
                case "ArrowUp":
                    eixoY--
                    break
                case "ArrowDown":
                    eixoY++
                    break
                case "ArrowLeft":
                    eixoX--
                    break
                case "ArrowRight":
                    break
            }
        }
    }*/
    //mapa:
    let mapa = [
        [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [2,1,0,1,1,1,1,1,0,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
        [2,1,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
        [2,1,0,1,0,1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
        [2,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [2,1,0,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],
        [2,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
        [2,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,0,1,1,0,1,0,1,0,1,1,1,1,1],
        [2,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0,0,0,1],
        [2,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,1,0,1,1,1,0,0,1,0,1,1,1,1,1,0,1],
        [2,1,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,0,0,1,0,1],
        [2,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,1,0,1],
        [2,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"V"],
        [2,1,0,1,1,0,0,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
        [2,1,0,1,1,1,0,1,1,0,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
        [2,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
        [2,1,0,0,0,1,0,0,0,0,0,0,1,1,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
        [2,1,0,1,0,1,0,1,1,0,1,1,0,0,0,0,1,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1],
        [2,1,0,1,0,0,0,0,0,0,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,0,0,0,0,1],
        [2,1,0,1,1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
        [2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
        [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  
        [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
    //variaveis de movimentação:
    let eixoX = 0;
    let eixoY = 0;
    let x = eixoX;
    let y = eixoY;
    //incrementação e decrementação
    function incremetarX(){
        x = eixoX;
        y = eixoY;
        eixoX++
        code = "d";
    }function incremetarY(){
        x = eixoX;
        y = eixoY;
        eixoY++
        code = "w";
    }
    function decrementarX(){
        x = eixoX;
        y = eixoY;
        eixoX--
        code = "a";
    }
    function decrementarY(){
        x = eixoX;
        y = eixoY;
        eixoY--
        code = "s";
    }
    //caso o jogador acerte uma parede podera voltar para sua posição anterior
    function ResertarPosicao(){
        eixoX = x;
        eixoY = y;
    }
    //carregando a imagem do jogador ou da estrada
    function IMGmovimentacao(i,j,x,y){
            if(y == i && x == j){
                return '/css/imagens/Dante.png'
            }else{
                return "/css/imagens/chaum.png"
            }
    }
    //gerando posição inicial do jogador
    function posicaoinicial(){
        for(let i in mapa[1]){
            if(mapa[1][i] == 0){
                //posição inicial do jogador
                eixoX = i
                eixoY = 1
                return 
            }
        }
    }
    //registro ainda sem utilização
    class personagem{
        constructor(body, moves){
            this.body = body;
            this.moves = moves;
        }
    }
    posicaoinicial()
    let contador = 0;
    function proximafase(){
        contador++
    }
</script>

<head>
    <link rel="stylesheet" href="/css/jogo.css">
</head>

<svelte:window on:keydown={handleKeydown}/>
<VoltarMenu/>

{#if (key)}
            {#if (code == "ArrowUp")}
            {decrementarY()} <!--para cima-->
            {:else if (code == "ArrowDown")}
            {incremetarY()} <!--para baixo-->
            {:else if (code == "ArrowLeft")}
            {decrementarX()}    <!--para esquerda-->
            {:else if (code == "ArrowRight")}
            {incremetarX()} <!--para direita-->
        {/if}
    {/if}

<input bind:value={contador} type="text" placeholder="Apenas letras maiusculas">

{#if (contador == 0)}
    

<table class='mapa'>
    {#each mapa as regiao,i}
<tr class='linhasdatabela'>
    {#each regiao as estrada,j}
        {#if (mapa[eixoY][eixoX] == "V")}
        {proximafase()}
        {:else if (mapa[eixoY][eixoX] != 0)}
        {ResertarPosicao()}
        {:else if (estrada == 0)}
        <th id="estrada"><img class="tabela" src="{IMGmovimentacao(i,j,eixoX,eixoY)}" alt="estrada"></th>
        {:else if (estrada == 2)}
        <th id="vazio" alt="vazio"></th>
        {:else if (estrada == 1)}
        <th id="parede"><img class="tabela" src="/css/imagens/paredeamalera1.png" alt="parede"></th>
        {:else if (estrada == 3)}
        <th id='parede'><img  class='tabela' src="/css/imagens/paradeamalera1.png" alt="parede"></th>
        {/if}
    {/each}
</tr>
{/each}
</table>
{:else if (contador == 800)}
<button on:click={() => contador = 0}>resetar</button>
<Fase1/>
{:else if (contador == 2)}
<button on:click={() => contador = 0}>resetar</button>
<Fase2/>
{:else if (contador == 3)}
<button on:click={() => contador = 0}>Resetar</button>
{/if}