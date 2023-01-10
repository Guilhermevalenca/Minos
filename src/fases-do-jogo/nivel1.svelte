<script>

    let key;
	let code;

	function handleKeydown(event) {
		key = event.key;
		code = event.code;
	}

    let mapa = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"V",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]

    let eixoX = 0;
    let eixoY = 0;
    let x = eixoX;
    let y = eixoY;

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

    function ResertarPosicao(){
        eixoX = x;
        eixoY = y;
    }
    function IMGmovimentacao(i,j,x,y){
            if(y == i && x == j){
                return '/css/imagens/Dante.png'
            }else{
                return "/css/imagens/chao1.png"
            }
    }
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
    posicaoinicial()
</script>

<svelte:window on:keydown={handleKeydown}/>

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
                <th id="parede"><img class="tabela" src="/css/imagens/paredeamalera1.png" alt="parede"></th>
                {/if}
            {/each}
        </tr>
    {/each}
</table>
