<script>
    let mapa = [
        [1,0,1],
        [0,0,1],
        [0,1,1],
        [0,0,1],
        [1,0,1]
    ];

    function posicao(){
        if(mapa[i][j] == 0){
            //devera andar
            jogador.position = mapa[i][j]
        }else{
            //nao podera passar
            
        }
    }

    function movimentacao(){
        //função chamada sempre quando o usuario fizer um movimento
    }

    function posicaoinicial(){
        for(let i in mapa[0]){
            if(mapa[0][i] == 0){
                //posição inicial do jogador
                jogador.position = mapa[0][i]
            }
        }
    }
    
    class personagem{
        constructor(position, moves){
            this.position = position;
            this.moves = moves;
        }
    }
    
    let jogador = new personagem(posicaoinicial(), movimentacao());
    
</script>
<ul class ='ajudaul'><button class='ulapp'><a href="/">return</a></button></ul>

{#each mapa as areas}
    <div>
        {#each areas as objetos}
            <ul>{objetos}</ul>
        {/each}
    </div>
{/each}

