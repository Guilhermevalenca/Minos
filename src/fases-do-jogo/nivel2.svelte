<script>

    let key;
	let code;

	function handleKeydown(event) {
		key = event.key;
		code = event.code;
	}

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
                return 
            }
        }
    }
    let mapa = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,0,0,0,1,0,1,1,0,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,2,2,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,2,2,2,1,1,0,0,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,0,1,0,1,2,2,2,2,2,2,2,2,2,2,1,1,1,0,0,1,1,1,1,1,1,1],
        [1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,2,2,2,2,2,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,1,0,1,1,0,0,0,0,1,0,0,0,0,1,2,2,2,2,2,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,1,1,1,0,1,1,0,1,2,2,2,2,2,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,0,0,0,0,1,1,0,1,2,2,2,2,2,1,1,1,1,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
        [1,1,1,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,0,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
        [1,1,1,2,2,2,2,0,1,1,0,0,1,1,1,0,0,1,2,2,2,2,2,2,2,2,2,1,1,0,1,1],
        [1,1,1,2,2,2,2,0,1,0,0,1,1,1,1,1,0,0,2,2,2,2,2,2,2,2,2,1,1,0,1,1],
        [1,1,1,2,2,2,2,0,0,0,1,1,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,1,1,0,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,1,1,0,1,1],
        [1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,1,1,0,1,1],
        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,2,2,2,2,2,1,0,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,2,2,2,2,0,0,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,2,2,2,2,0,1,1,1,1,1]
    ]
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
                    <th id="parede"><img class="tabela" src="/css/imagens/parede.jpg" alt="parede"></th>
                    {/if}
                {/each}
            </tr>
        {/each}
    </table>