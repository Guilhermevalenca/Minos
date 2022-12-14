<script>
    let mapa = [
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
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
    let eixoX = 0;
    let eixoY = 0;
    let x = eixoX;
    let y = eixoY;

    function ResertarPosicao(){
        eixoX = x;
        eixoY = y;
    }

    function IMGmovimentacao(i,j,x,y){
            if(y == i && x == j){
                return '/css/imagens/Dante.png'
            }else{
                return "/css/imagens/estrada-jogo.jpg"
            }
    }

    function posicaoinicial(){
        for(let i in mapa[0]){
            if(mapa[0][i] == 0){
                //posição inicial do jogador
                eixoX = i
                eixoY = 0
            }
        }
    }
    
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

<ul><button id="buttonjogo" class='botao' on:click={() => {y = eixoY; eixoY--}}>↟</button></ul>
<ul><button class='botao' on:click={() => {x = eixoX;eixoX--}}>↞</button> <button class="botao" on:click={() => {x = eixoX;eixoX++}}>↠</button></ul>
<ul><button id="buttonjogo" class='botao' on:click={() =>{y = eixoY;eixoY++}}>↡</button></ul>
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
