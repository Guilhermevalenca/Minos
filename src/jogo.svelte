<script>
    //imports fases do jogo:
    import Vitoria from './Vitoria.svelte'
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
    let contador = 0;
    function proximafase(teste){
        if (teste == "V") {
            contador = 4;
        }else if (teste == "X") {
            contador = 1;
        }else if (teste == "Y") {
            contador = 2;
        }else if (teste == "Z") {
            contador = 3;
        }return contador;
    }
    function resertar(){
        contador = 0;
    }
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
        [2,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"X"],
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
    let mapa1 = [
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
        [2,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [2,1,0,1,1,0,0,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
        [2,1,0,1,1,1,0,1,1,0,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
        [2,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
        [2,1,0,0,0,1,0,0,0,0,0,0,1,1,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
        [2,1,0,1,0,1,0,1,1,0,1,1,0,0,0,0,1,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1],
        [2,1,0,1,0,0,0,0,0,0,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,0,0,0,0,1],
        [2,1,0,1,1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
        [2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
        [2,1,"Y",0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  
        [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
    let mapa2 = [
        [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,"Z",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
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
        [2,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
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
    let mapa3 = [
        [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [2,1,0,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],
        [2,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
        [2,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,0,1,1,0,1,0,1,0,1,1,1,1,1],
        [2,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0,0,0,1],
        [2,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,1,0,1,1,1,0,0,1,0,1,1,1,1,1,0,1],
        [2,1,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,0,0,1,0,1],
        [2,1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,1,0,1],
        [2,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
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
        [2,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"V"],
        [2,1,0,1,1,1,1,1,0,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
        [2,1,0,1,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
        [2,1,0,1,0,1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
        [2,1,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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
    function IMGmovimentacao(i,j,x,y,mapa){
            if (y == i && x == j) {
                return '/css/imagens/soacabecinha.png'
            }
            //Chao do mapa:
            if (mapa == 0) {
                return "/css/imagens/chaum.png"
            }else if (mapa == 1) {
                return "/css/imagens/chaum.png"
            }else if (mapa == 2) {
                return "/css/imagens/chaum.png"
            }else if (mapa == 3) {
                return "/css/imagens/chaum.png"
            }
    }
    //gerando posição inicial do jogador
    function posicaoinicial(mapa){
        for(let i in mapa){
            for(let j in mapa[i]){
                if(mapa[i][j] == 0){
                    eixoX = j;
                    eixoY = i;
                    return
                }
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


{#if (contador == 0)}
    
    {posicaoinicial(mapa)}

<table class='mapa'>
    {#each mapa as regiao,i}
<tr class='linhasdatabela'>
    {#each regiao as estrada,j}
        {#if (mapa[eixoY][eixoX] == "X")}
        {proximafase(mapa[eixoY][eixoX])}
        {:else if (mapa[eixoY][eixoX] != 0)}
        {ResertarPosicao()}
        {:else if (estrada == 0)}
        <th id="estrada"><img class="tabela" src="{IMGmovimentacao(i,j,eixoX,eixoY,contador)}" alt="estrada"></th>
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
{:else if (contador == 1)}

{posicaoinicial(mapa1)}

<table class='mapa'>
    {#each mapa1 as regiao,i}
<tr class='linhasdatabela'>
    {#each regiao as estrada,j}
        {#if (mapa1[eixoY][eixoX] == "Y")}
        {proximafase(mapa1[eixoY][eixoX])}
        {:else if (mapa1[eixoY][eixoX] != 0)}
        {ResertarPosicao()}
        {:else if (estrada == 0)}
        <th id="estrada"><img class="tabela" src="{IMGmovimentacao(i,j,eixoX,eixoY,contador)}" alt="estrada"></th>
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
{:else if (contador == 2)}

{posicaoinicial(mapa2)}

<table class='mapa'>
    {#each mapa2 as regiao,i}
<tr class='linhasdatabela'>
    {#each regiao as estrada,j}
        {#if (mapa2[eixoY][eixoX] == "Z")}
        {proximafase(mapa2[eixoY][eixoX])}
        {:else if (mapa2[eixoY][eixoX] != 0)}
        {ResertarPosicao()}
        {:else if (estrada == 0)}
        <th id="estrada"><img class="tabela" src="{IMGmovimentacao(i,j,eixoX,eixoY,contador)}" alt="estrada"></th>
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
{:else if (contador == 3)}

{posicaoinicial(mapa3)}

<table class='mapa'>
    {#each mapa3 as regiao,i}
<tr class='linhasdatabela'>
    {#each regiao as estrada,j}
        {#if (mapa3[eixoY][eixoX] == "V")}
        {proximafase(mapa3[eixoY][eixoX])}
        {:else if (mapa3[eixoY][eixoX] != 0)}
        {ResertarPosicao()}
        {:else if (estrada == 0)}
        <th id="estrada"><img class="tabela" src="{IMGmovimentacao(i,j,eixoX,eixoY,contador)}" alt="estrada"></th>
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
{:else if (contador == 4)}
<Vitoria/>
{/if}