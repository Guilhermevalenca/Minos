<script>

    let mapa = [
        [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //1
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //2
        [0,1,0,3,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //3
        [0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //4
        [0,0,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //5
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //6
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //7
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //8
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //9
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], //10
        [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  //11
    ];

    function testarposicao(){
        if(mapa[i][j] == 0){
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
    <link rel="stylesheet" href="jogo.css">
</head>
<ul class ='ajudaul'><button class='ulapp'><a href="/">Voltar</a></button></ul>

<table class='mapa'>
    {#each mapa as regiao}
        <tr>
            {#each regiao as estrada}
                <th class='tabela'>{estrada}</th>
            {/each}
        </tr>
    {/each}
</table>

