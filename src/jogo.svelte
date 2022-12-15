<script>
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
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,0,0,0,1,0,1,1,0,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,2,2,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,2,2,2,1,1,0,0,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,1,0,1,2,2,2,2,2,2,2,2,2,2,1,1,1,0,0,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,2,2,2,2,2,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,1,0,1,1,0,0,0,0,1,0,0,0,0,1,2,2,2,2,2,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,1,1,1,0,1,1,0,1,2,2,2,2,2,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,2,2,2,2,2,1,1,1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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
                return "/css/imagens/estrada-jogo.jpg"
            }
    }
    //gerando posição inicial do jogador
    function posicaoinicial(){
        for(let i in mapa[1]){
            if(mapa[1][i] == 0){
                //posição inicial do jogador
                eixoX = i
                eixoY = 1
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
</script>
<head>
    <link rel="stylesheet" href="/css/jogo.css">
</head>
<ul class ='ajudaul'><button class='ulapp'><a href="/">Voltar</a></button></ul>

<svelte:window on:keydown={handleKeydown}/>
<ul><button id="buttonjogo" class='botao' on:click={() => {y = eixoY;x = eixoX; eixoY--}}>↟</button></ul>
<ul><button class='botao' on:click={() => {x = eixoX;y = eixoY;eixoX--}}>↞</button> <button class="botao" on:click={() => {x = eixoX;y = eixoY;eixoX++}}>↠</button></ul>
<ul><button id="buttonjogo" class='botao' on:click={() =>{y = eixoY;x = eixoX;eixoY++}}>↡</button></ul>
    {#if (key)}
            {#if (code == "ArrowUp")}
            {decrementarY()}
            {:else if (code == "ArrowDown")}
            {incremetarY()}
            {:else if (code == "ArrowLeft")}
            {decrementarX()}
            {:else if (code == "ArrowRight")}
            {incremetarX()}
        {/if}
    {/if}
<table class='mapa'>
    {#each mapa as regiao,i}
        <tr class='linhasdatabela'>
            {#each regiao as estrada,j}
                {#if (mapa[eixoY][eixoX] != 0)}
                {ResertarPosicao()}
                {:else if (estrada == 0)}
                <th id="estrada"><img class="tabela" src="{IMGmovimentacao(i,j,eixoX,eixoY)}" alt="estrada"></th>
                {:else if (estrada == 2)}
                <th id="vazio" alt="vazio"></th>
                {:else if (estrada == 1)}
                <th id="parede"><img class="tabela" src="/css/imagens/parede.jpg" alt="parede"></th>
                {/if}
            {/each}
        </tr>
    {/each}
</table>
