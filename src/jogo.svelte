<script>
    let mapa = [
        [2,2,2,2,2,2,2,2,2,2],
        [2,1,0,1,1,1,1,1,1,2], //1
        [2,0,0,0,0,1,0,0,0,2], //2
        [2,0,1,1,0,0,0,1,0,2], //3
        [2,0,1,1,0,1,1,1,1,2], //4
        [2,0,0,1,0,1,0,0,1,2], //5
        [2,1,0,1,0,1,0,1,1,2], //6
        [2,1,0,1,0,0,0,1,1,2], //7
        [2,1,0,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], //8
        [2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], //9
        [2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,2], //10
        [2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,2],  //11
        [2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,2], //1
        [2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,2], //2
        [2,0,1,1,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,3,0,0,0,1,0,1,1,2], //3
        [2,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,1,1,1,1,1,1,2], //4
        [2,0,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,1,2], //5
        [2,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,1,1,2], //6
        [2,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,1,1,2], //7
        [2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,2], //8
        [2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], //9
        [2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], //10
        [2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2] 
    ];

    function testarposicao(){
        if(mapa[i][j] == 0 || mapa[i][j] == 1){
            //devera andar
            jogador.position = mapa[i][j]
        }else{
            //nao podera passar
        }
    }

    function movimentacao(){
        //função chamada sempre quando o usuario fizer um movimento
        testarposicao()
    }

    function posicaoinicial(){
        for(let i in mapa[0]){
            if(mapa[0][i] == 0){
                //posição inicial do jogador
               return jogador.position = mapa[0][i]
            }
        }
    }
    
    class personagem{
        constructor(position, moves){
            this.position = position;
            this.moves = moves;
        }
    }
    
    let jogador = new personagem();
</script>
<head>
    <link rel="stylesheet" href="/css/jogo.css">
</head>
<ul class ='ajudaul'><button class='ulapp'><a href="/">Voltar</a></button></ul>

<table class='mapa'>
    {#each mapa as regiao}
        <tr class='linhasdatabela'>
            {#each regiao as estrada}
                {#if (estrada == 0)}
                <th><img class='tabela' src="/css/imagens/estrada-jogo.jpg" alt="estrada" width="36px"></th>     
                {:else if (estrada == 2)}
                <th><img class='tabela' src="https://img.elo7.com.br/product/600x380/14B5578/papel-de-parede-tijolinho-barro-crie-decore.jpg" alt="parede" width="36px"></th>
                {:else}
                <th><img class="tabela" src="https://conexaoplaneta.com.br/wp-content/uploads/2018/03/mato.png" alt="parede"></th>
                {/if}
            {/each}
        </tr>
    {/each}
</table>

