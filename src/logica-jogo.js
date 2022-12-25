export var contador = 0;
    export function proximafase(teste){
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
    export function resertar(){
        contador = 0;
    }