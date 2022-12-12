<script>
    let mapa = [
        [2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,2], //1
        [2,0,0,0,0,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,2], //2
        [2,0,1,1,0,0,0,1,0,1,1,0,1,1,0,0,0,1,0,1,1,0,1,1,0,0,0,1,0,2], //3
        [2,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,0,1,0,1,1,0,1,1,1,1,2], //4
        [2,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,2], //5
        [2,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1,0,1,0,1,1,2], //6
        [2,1,0,1,0,0,0,1,1,1,1,1,0,1,0,0,0,1,1,1,0,1,0,1,0,0,0,1,1,2], //7
        [2,1,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,0,2,2,2,2,2], //8
        [2,1,0,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,2], //9
        [2,1,0,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,2], //10
        [2,1,0,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,2], //11
        [2,1,0,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,2], //1
        [2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2], //2
        [2,0,1,1,0,0,0,1,0,1,1,1,1,2,1,1,1,1,1,1,1,1,1,0,1,1,3,0,0,2], //3
        [2,0,1,0,0,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,0,1,1,0,0,1,2], //4
        [2,0,1,1,0,1,0,0,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,0,0,1,1,0,1,2], //5
        [2,0,1,1,0,1,0,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,2], //6
        [2,0,1,0,0,0,0,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,2], //7
        [2,0,1,1,0,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,2], //8
        [2,0,1,1,0,0,0,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], //9
        [2,0,0,1,1,1,0,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2], //10
        [2,1,0,0,0,0,0,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2] 
    ]
    function testarposicao(i,j){
        if(mapa[i][j] == 0 || mapa[i][j] == 1){
            //devera andar
            return mapa[i][j] = jogador
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
            return mapa[0][i] = jogador;
            }
        }
    }
    
    class personagem{
        constructor(body, moves){
            this.body = body;
            this.moves = moves;
        }
    }
    
    let jogador = "jogador";

</script>
<head>
    <link rel="stylesheet" href="/css/jogo.css">
</head>
<ul class ='ajudaul'><button class='ulapp'><a href="/">Voltar</a></button></ul>

<table class='mapa'>
    {posicaoinicial()}
    {#each mapa as regiao,i}
        <tr class='linhasdatabela'>
            {#each regiao as estrada,j}
                {#if (estrada == "jogador")}
                <th><img class='tabela' id='jogador' src="/css/imagens/personagem.webp" alt="personagem"></th>
                {mapa[i][j] = 0}
                {:else if (estrada == 0)}
                <th><img class='tabela' src="/css/imagens/estrada-jogo.jpg" alt="estrada"></th>     
                {:else if (estrada == 2)}
                <th onclick="alert('vc nao pode passar')"><img class='tabela' src="/css/imagens//parede.jpg" alt="parede"></th>
                {:else}
                <th ><img class='tabela' src="https://conexaoplaneta.com.br/wp-content/uploads/2018/03/mato.png" alt="mato"></th>
                {/if}
            {/each}
        </tr>
    {/each}
</table>
