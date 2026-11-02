// Fundamentos de Programación · 60 reactivos: 6 por tema.
// tipo: "concepto" | "imprime" | "error" | "completa"
// En los reactivos "imprime", la opción correcta es exactamente la salida del programa (verificado con gcc).
// Los ids llevan el prefijo fp- para no chocar con los de Programación Estructurada.
const c = String.raw;

export const PREGUNTAS = [
  // ───────── Tema 1 · La computadora y los sistemas numéricos
  {
    id: "fp-t1-1", tema: 1, tipo: "concepto",
    pregunta: "¿Qué lenguaje entiende directamente la CPU, sin necesidad de traducción?",
    opciones: ["Lenguaje C", "Lenguaje máquina (binario)", "Ensamblador", "Pseudocódigo"],
    correcta: 1,
    explicacion: "La CPU solo ejecuta instrucciones en binario (0 y 1). El ensamblador necesita un ensamblador y C necesita un compilador para llegar a lenguaje máquina."
  },
  {
    id: "fp-t1-2", tema: 1, tipo: "concepto",
    pregunta: "¿Cuánto vale el número binario 1101 en decimal?",
    opciones: ["13", "11", "15", "1101"],
    correcta: 0,
    explicacion: "Cada posición vale una potencia de 2: 1·8 + 1·4 + 0·2 + 1·1 = 13."
  },
  {
    id: "fp-t1-3", tema: 1, tipo: "concepto",
    pregunta: "¿Cómo se escribe el decimal 45 en binario?",
    opciones: ["110101", "101011", "100101", "101101"],
    correcta: 3,
    explicacion: "45 = 32 + 8 + 4 + 1. Con las potencias 32 16 8 4 2 1 queda 1 0 1 1 0 1 → 101101."
  },
  {
    id: "fp-t1-4", tema: 1, tipo: "concepto",
    pregunta: "¿Cuánto vale el hexadecimal 2F en decimal?",
    opciones: ["31", "215", "47", "45"],
    correcta: 2,
    explicacion: "En hexadecimal F vale 15. Entonces 2F = 2·16 + 15 = 47."
  },
  {
    id: "fp-t1-5", tema: 1, tipo: "concepto",
    pregunta: "¿Cómo se escribe el binario 110101 en octal?",
    opciones: ["53", "65", "56", "35"],
    correcta: 1,
    explicacion: "Se agrupa de 3 en 3 bits desde la derecha: 110 | 101. 110 = 6 y 101 = 5, así que queda 65 en octal."
  },
  {
    id: "fp-t1-6", tema: 1, tipo: "concepto",
    pregunta: "¿Qué caracteriza al modelo de Von Neumann?",
    opciones: ["Los datos y las instrucciones se guardan en la misma memoria", "La CPU no tiene unidad de control", "Solo tiene dispositivos de salida", "El programa se ejecuta directamente desde el teclado"],
    correcta: 0,
    explicacion: "Von Neumann propuso guardar el programa (instrucciones) y los datos en la misma memoria. La CPU, con su unidad de control y su unidad aritmético-lógica, los toma de ahí."
  },

  // ───────── Tema 2 · Algoritmos y proceso de programación
  {
    id: "fp-t2-1", tema: 2, tipo: "concepto",
    pregunta: "Un algoritmo repite un paso para siempre y nunca da un resultado. ¿Qué característica no cumple?",
    opciones: ["Finito", "Preciso", "Definido", "Tener entrada"],
    correcta: 0,
    explicacion: "Un algoritmo debe terminar en un número limitado de pasos. Si nunca termina, no es finito."
  },
  {
    id: "fp-t2-2", tema: 2, tipo: "concepto",
    pregunta: "En el algoritmo del área de un triángulo, ¿qué parte es la línea area ← base * altura / 2?",
    codigo: c`Inicio
  Leer base, altura
  area ← base * altura / 2
  Escribir area
Fin`,
    opciones: ["Entrada", "Salida", "Definición del problema", "Proceso"],
    correcta: 3,
    explicacion: "Leer es la entrada, el cálculo es el proceso y Escribir es la salida."
  },
  {
    id: "fp-t2-3", tema: 2, tipo: "concepto",
    pregunta: "¿Cuál es el orden correcto de las fases para desarrollar un programa?",
    opciones: ["Codificación, análisis, diseño, prueba, definición del problema, mantenimiento", "Análisis, codificación, definición del problema, diseño, prueba, mantenimiento", "Definición del problema, análisis, diseño, codificación, prueba, mantenimiento", "Diseño, definición del problema, prueba, codificación, análisis, mantenimiento"],
    correcta: 2,
    explicacion: "Primero se entiende y analiza el problema, luego se diseña el algoritmo, se codifica, se prueba y al final se da mantenimiento."
  },
  {
    id: "fp-t2-4", tema: 2, tipo: "concepto",
    pregunta: "¿En qué fase se elabora el algoritmo con diagrama de flujo o pseudocódigo?",
    opciones: ["Análisis", "Diseño", "Codificación", "Mantenimiento"],
    correcta: 1,
    explicacion: "En el diseño se escribe la solución paso a paso. En la codificación esa solución se traduce a un lenguaje como C."
  },
  {
    id: "fp-t2-5", tema: 2, tipo: "concepto",
    pregunta: "Según la programación estructurada, ¿con qué estructuras se puede construir cualquier programa?",
    opciones: ["Secuencia, selección y repetición", "Clases, objetos y herencia", "Entrada, proceso y salida", "Variables, constantes y funciones"],
    correcta: 0,
    explicacion: "El paradigma estructurado usa solo secuencia, selección (if, switch) y repetición (while, do-while, for), sin saltos como goto."
  },
  {
    id: "fp-t2-6", tema: 2, tipo: "concepto",
    pregunta: "Una receta dice: \"Agrega un poco de sal\". ¿Por qué no es un buen paso de algoritmo?",
    opciones: ["No es finito", "No tiene salida", "No es un proceso", "No es preciso: \"un poco\" es ambiguo"],
    correcta: 3,
    explicacion: "Cada paso debe ser preciso, sin ambigüedad. \"Un poco\" puede significar cosas distintas para cada persona."
  },

  // ───────── Tema 3 · Diagramas de flujo y pseudocódigo
  {
    id: "fp-t3-1", tema: 3, tipo: "concepto",
    pregunta: "En un diagrama de flujo, ¿qué símbolo representa una decisión?",
    opciones: ["Rectángulo", "Paralelogramo", "Óvalo", "Rombo"],
    correcta: 3,
    explicacion: "El rombo tiene una entrada y dos salidas (verdadero y falso). Se usa para condiciones."
  },
  {
    id: "fp-t3-2", tema: 3, tipo: "concepto",
    pregunta: "¿Qué representa el paralelogramo en un diagrama de flujo?",
    opciones: ["Un cálculo o proceso", "El inicio o el fin", "Entrada o salida de datos", "Una decisión"],
    correcta: 2,
    explicacion: "El paralelogramo se usa para leer o mostrar datos. Los cálculos van en rectángulos y el inicio y fin en óvalos."
  },
  {
    id: "fp-t3-3", tema: 3, tipo: "concepto",
    pregunta: "¿Qué escribe este pseudocódigo?",
    codigo: c`Inicio
  x ← 4
  y ← x * 2
  x ← y - 1
  Escribir x, y
Fin`,
    opciones: ["4 8", "7 8", "8 7", "3 8"],
    correcta: 1,
    explicacion: "y toma 4 * 2 = 8. Luego x cambia a 8 - 1 = 7. Al final x vale 7 y y vale 8."
  },
  {
    id: "fp-t3-4", tema: 3, tipo: "concepto",
    pregunta: "¿Qué escribe este pseudocódigo?",
    codigo: c`Inicio
  n ← 15
  Si n mod 3 = 0 Entonces
    Escribir "Fizz"
  Sino
    Escribir n
  FinSi
Fin`,
    opciones: ["Fizz", "15", "Fizz 15", "No escribe nada"],
    correcta: 0,
    explicacion: "15 mod 3 es 0 (15 entre 3 no deja residuo), así que la condición es verdadera y solo se ejecuta la rama Entonces."
  },
  {
    id: "fp-t3-5", tema: 3, tipo: "concepto",
    pregunta: "Haz la corrida de escritorio. ¿Qué valor escribe?",
    codigo: c`i ← 1
s ← 0
Mientras i <= 4 Hacer
  s ← s + i
  i ← i + 2
FinMientras
Escribir s`,
    opciones: ["10", "9", "6", "4"],
    correcta: 3,
    explicacion: "Vuelta 1: s = 1, i = 3. Vuelta 2: s = 4, i = 5. Como 5 <= 4 es falso, el ciclo termina y escribe 4."
  },
  {
    id: "fp-t3-6", tema: 3, tipo: "concepto",
    pregunta: "¿En qué consiste la corrida (prueba) de escritorio?",
    opciones: ["Compilar el programa hasta que no tenga errores", "Dibujar el diagrama de flujo en una hoja", "Seguir el algoritmo a mano anotando cómo cambian las variables", "Agregar comentarios al código"],
    correcta: 2,
    explicacion: "Se ejecuta el algoritmo \"en papel\", paso a paso, con una tabla de variables. Sirve para encontrar errores de lógica antes de programar."
  },

  // ───────── Tema 4 · Lenguaje C: tipos de datos, variables y constantes
  {
    id: "fp-t4-1", tema: 4, tipo: "concepto",
    pregunta: "¿Quién creó el lenguaje C y dónde?",
    opciones: ["James Gosling, en Sun Microsystems", "Guido van Rossum, en el CWI", "Dennis Ritchie, en los Laboratorios Bell", "Alan Turing, en Cambridge"],
    correcta: 2,
    explicacion: "Dennis Ritchie desarrolló C en los Laboratorios Bell a inicios de los años 70, originalmente para escribir el sistema operativo UNIX."
  },
  {
    id: "fp-t4-2", tema: 4, tipo: "concepto",
    pregunta: "¿Cuál de estos NO puede usarse como nombre de variable en C?",
    opciones: ["total", "while", "suma_2", "_contador"],
    correcta: 1,
    explicacion: "while es una palabra reservada del lenguaje. Los nombres pueden llevar letras, números y guion bajo, pero no pueden ser palabras reservadas."
  },
  {
    id: "fp-t4-3", tema: 4, tipo: "error",
    pregunta: "Este programa no compila. ¿Cuál es el error?",
    codigo: c`int main() {
    int 2numero = 5;
    printf("%d", 2numero);
    return 0;
}`,
    opciones: ["Un nombre de variable no puede empezar con un número", "int no es un tipo válido", "El 5 debe ir entre comillas", "printf no acepta %d"],
    correcta: 0,
    explicacion: "Los identificadores deben empezar con letra o guion bajo. numero2 o num_2 sí serían válidos."
  },
  {
    id: "fp-t4-4", tema: 4, tipo: "error",
    pregunta: "Este programa no compila. ¿Cuál es el error?",
    codigo: c`#define IVA 0.16

int main() {
    float precio = 100;
    IVA = 0.08;
    printf("%.2f", precio * IVA);
    return 0;
}`,
    opciones: ["#define debe ir dentro de main", "precio debe ser int", "Falta el & en printf", "No se le puede asignar un valor a una constante"],
    correcta: 3,
    explicacion: "IVA es una constante: el preprocesador la reemplaza por 0.16, así que la línea queda 0.16 = 0.08, que no es válida. Una constante no cambia durante la ejecución."
  },
  {
    id: "fp-t4-5", tema: 4, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`char letra = 'A';
int n = 7;
float x = 2.5;
printf("%c %d %.1f", letra, n, x);`,
    opciones: ["65 7 2.5", "A 7 2.500000", "A 7 2.5", "'A' 7 2.5"],
    correcta: 2,
    explicacion: "%c muestra el carácter (A), %d el entero y %.1f el real con un decimal. Sin el .1 se verían 6 decimales."
  },
  {
    id: "fp-t4-6", tema: 4, tipo: "completa",
    pregunta: "¿Qué biblioteca hay que incluir para usar sqrt y pow?",
    codigo: c`#include <stdio.h>
#include <________>

int main() {
    printf("%.1f", sqrt(16) + pow(2, 3));
    return 0;
}`,
    opciones: ["stdlib.h", "math.h", "string.h", "stdio.h"],
    correcta: 1,
    explicacion: "math.h trae las funciones matemáticas (sqrt, pow, fabs…). stdio.h es para entrada y salida, y stdlib.h para funciones generales como rand o exit."
  },

  // ───────── Tema 5 · Operadores y expresiones
  {
    id: "fp-t5-1", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a = 17, b = 5;
printf("%d %d", a / b, a % b);`,
    opciones: ["3.4 2", "3 2", "3 3", "2 3"],
    correcta: 1,
    explicacion: "Entre enteros, 17 / 5 da 3 (se descartan los decimales). 17 % 5 es el residuo: 2."
  },
  {
    id: "fp-t5-2", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int r = 2 + 3 * 4 - 6 / 2;
printf("%d", r);`,
    opciones: ["11", "17", "7", "14"],
    correcta: 0,
    explicacion: "Primero * y /: 3 * 4 = 12 y 6 / 2 = 3. Luego de izquierda a derecha: 2 + 12 - 3 = 11."
  },
  {
    id: "fp-t5-3", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int x = 5, y = 10;
printf("%d %d %d", x > y, x < y && y == 10, !(x == 5));`,
    opciones: ["1 0 1", "0 1 1", "0 0 0", "0 1 0"],
    correcta: 3,
    explicacion: "x > y es falso (0). x < y y y == 10 son verdaderas, así que && da 1. x == 5 es verdadero y ! lo niega: 0."
  },
  {
    id: "fp-t5-4", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a = 5;
int b = a++;
int c = ++a;
printf("%d %d %d", a, b, c);`,
    opciones: ["7 6 7", "6 5 6", "7 5 7", "7 5 6"],
    correcta: 2,
    explicacion: "b = a++ copia el 5 y después a sube a 6. c = ++a primero sube a a 7 y luego copia el 7."
  },
  {
    id: "fp-t5-5", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int n = 10;
n += 5;
n *= 2;
n -= 3;
n /= 3;
printf("%d", n);`,
    opciones: ["27", "9", "10", "30"],
    correcta: 1,
    explicacion: "10 + 5 = 15, 15 * 2 = 30, 30 - 3 = 27 y 27 / 3 = 9."
  },
  {
    id: "fp-t5-6", tema: 5, tipo: "error",
    pregunta: "Este programa siempre imprime \"Tienes 18\", sin importar la edad que se lea. ¿Cuál es el error?",
    codigo: c`int edad;
scanf("%d", &edad);
if (edad = 18)
    printf("Tienes 18");`,
    opciones: ["Usa = (asignación) en lugar de == (comparación)", "Falta el & en printf", "edad debe ser float", "Falta un else"],
    correcta: 0,
    explicacion: "edad = 18 asigna 18 a edad y la expresión vale 18, que es distinto de 0 y por lo tanto verdadero. Para comparar se usa ==."
  },

  // ───────── Tema 6 · Estructura secuencial y entrada/salida
  {
    id: "fp-t6-1", tema: 6, tipo: "error",
    pregunta: "El programa compila, pero el peso leído sale con un valor extraño. ¿Cuál es el error?",
    codigo: c`float peso;
printf("Peso: ");
scanf("%d", &peso);
printf("%.1f", peso);`,
    opciones: ["Para leer un float se usa %f, no %d", "Falta el & en printf", "peso debe declararse como int", "Falta un \\n en printf"],
    correcta: 0,
    explicacion: "El especificador debe coincidir con el tipo: %d es para int y %f para float (en scanf, %lf para double)."
  },
  {
    id: "fp-t6-2", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a = 3, b = 4;
printf("%d + %d = %d", a, b, a + b);`,
    opciones: ["a + b = 7", "%d + %d = 7", "3 + 4 = a + b", "3 + 4 = 7"],
    correcta: 3,
    explicacion: "Cada %d se reemplaza, en orden, por los valores que van después de la cadena: a, b y a + b."
  },
  {
    id: "fp-t6-3", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`float precio = 49.5;
int cant = 3;
printf("Total: %.2f", precio * cant);`,
    opciones: ["Total: 148.5", "Total: 148", "Total: 148.50", "Total: 148.500000"],
    correcta: 2,
    explicacion: "49.5 * 3 = 148.5 y %.2f siempre muestra exactamente 2 decimales: 148.50."
  },
  {
    id: "fp-t6-4", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a = 5, b = 8, aux;
aux = a;
a = b;
b = aux;
printf("%d %d", a, b);`,
    opciones: ["5 8", "8 5", "8 8", "5 5"],
    correcta: 1,
    explicacion: "Es un intercambio: aux guarda el 5, a toma el 8 y b recupera el 5 desde aux."
  },
  {
    id: "fp-t6-5", tema: 6, tipo: "completa",
    pregunta: "¿Qué especificador va en el espacio para leer un double?",
    codigo: c`double sueldo;
scanf("________", &sueldo);`,
    opciones: ["%lf", "%d", "%c", "%s"],
    correcta: 0,
    explicacion: "En scanf, %lf lee un double y %f un float. %d es para enteros, %c para un carácter y %s para cadenas."
  },
  {
    id: "fp-t6-6", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`printf("Uno\n");
printf("Dos ");
printf("Tres");`,
    opciones: ["Uno Dos Tres", "Uno\nDos\nTres", "UnoDos Tres", "Uno\nDos Tres"],
    correcta: 3,
    explicacion: "Solo el primer printf tiene \\n, así que únicamente hay un salto de línea, después de Uno."
  },

  // ───────── Tema 7 · Estructuras selectivas
  {
    id: "fp-t7-1", tema: 7, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int calif = 75;
if (calif >= 90) printf("A");
else if (calif >= 70) printf("B");
else if (calif >= 60) printf("C");
else printf("D");`,
    opciones: ["BC", "C", "BCD", "B"],
    correcta: 3,
    explicacion: "Las condiciones se revisan en orden y solo se ejecuta la primera verdadera. 75 >= 70 es la primera que se cumple."
  },
  {
    id: "fp-t7-2", tema: 7, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int op = 2;
switch (op) {
    case 1: printf("uno|");
    case 2: printf("dos|");
    case 3: printf("tres|");
        break;
    default: printf("otro");
}`,
    opciones: ["dos|", "dos|tres|otro", "dos|tres|", "uno|dos|tres|"],
    correcta: 2,
    explicacion: "Entra en el case 2, y como no tiene break, sigue con el case 3 hasta encontrar el break."
  },
  {
    id: "fp-t7-3", tema: 7, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int x = 3;
if (x > 5)
    printf("Mayor ");
    printf("Fin");`,
    opciones: ["Mayor Fin", "Fin", "Mayor", "No imprime nada"],
    correcta: 1,
    explicacion: "Sin llaves, el if solo controla la siguiente instrucción. printf(\"Fin\") está fuera del if aunque esté sangrado."
  },
  {
    id: "fp-t7-4", tema: 7, tipo: "completa",
    pregunta: "¿Qué condición va en el espacio para saber si n es par?",
    codigo: c`if (________)
    printf("Par");
else
    printf("Impar");`,
    opciones: ["n % 2 == 0", "n / 2 == 0", "n % 2 = 0", "n % 2 == 1"],
    correcta: 0,
    explicacion: "Un número es par si al dividirlo entre 2 el residuo es 0. Con = en vez de == sería una asignación."
  },
  {
    id: "fp-t7-5", tema: 7, tipo: "error",
    pregunta: "Este programa no compila. ¿Cuál es el error?",
    codigo: c`float opcion;
scanf("%f", &opcion);
switch (opcion) {
    case 1: printf("Sumar"); break;
    case 2: printf("Restar"); break;
}`,
    opciones: ["Falta el default", "Los case deben ir en orden descendente", "break no se usa en switch", "switch solo funciona con valores enteros o char, no con float"],
    correcta: 3,
    explicacion: "La expresión del switch debe ser entera (int, char…). Para un menú, opcion debería declararse como int."
  },
  {
    id: "fp-t7-6", tema: 7, tipo: "concepto",
    pregunta: "En un switch, ¿cuándo se ejecuta el bloque default?",
    opciones: ["Siempre, al final de cada case", "Solo cuando la variable vale 0", "Cuando ningún case coincide con el valor", "Cuando un case no tiene break"],
    correcta: 2,
    explicacion: "default es la opción \"si no es ninguna de las anteriores\". Es opcional y suele ir al final."
  },

  // ───────── Tema 8 · Ciclos mientras y hacer-mientras
  {
    id: "fp-t8-1", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int i = 1;
while (i < 20) {
    printf("%d,", i);
    i *= 3;
}`,
    opciones: ["1,3,9,27,", "1,2,3,", "1,3,9,", "3,9,"],
    correcta: 2,
    explicacion: "i toma 1, 3 y 9. Cuando vale 27, 27 < 20 es falso y el ciclo termina sin imprimirlo."
  },
  {
    id: "fp-t8-2", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int n = 10;
do {
    printf("%d", n);
    n++;
} while (n < 5);`,
    opciones: ["No imprime nada", "10", "5", "1011"],
    correcta: 1,
    explicacion: "do-while ejecuta el cuerpo antes de revisar la condición, así que imprime 10 una vez. Después 11 < 5 es falso y termina."
  },
  {
    id: "fp-t8-3", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int i = 1, suma = 0;
while (i <= 5) {
    suma += i;
    i++;
}
printf("%d %d", suma, i);`,
    opciones: ["15 6", "15 5", "10 5", "15 7"],
    correcta: 0,
    explicacion: "suma acumula 1 + 2 + 3 + 4 + 5 = 15. El ciclo termina cuando i llega a 6."
  },
  {
    id: "fp-t8-4", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int n = 21, d = 2, primo = 1;
while (d < n) {
    if (n % d == 0) primo = 0;
    d++;
}
printf("%d", primo);`,
    opciones: ["1", "3", "21", "0"],
    correcta: 3,
    explicacion: "primo es una bandera que empieza en 1. Cuando d vale 3, 21 % 3 == 0, así que la bandera baja a 0: 21 no es primo."
  },
  {
    id: "fp-t8-5", tema: 8, tipo: "error",
    pregunta: "Este programa nunca termina. ¿Cuál es el error?",
    codigo: c`int i = 0;
while (i < 10) {
    printf("%d ", i);
}`,
    opciones: ["while debe llevar punto y coma", "i debe empezar en 1", "Falta incrementar i dentro del ciclo", "printf no puede ir dentro de un while"],
    correcta: 2,
    explicacion: "Como i nunca cambia, i < 10 siempre es verdadero y el ciclo es infinito. Falta i++ dentro del cuerpo."
  },
  {
    id: "fp-t8-6", tema: 8, tipo: "completa",
    pregunta: "Se leen números hasta que llegue -1 y se quiere saber cuántos se leyeron. ¿Qué va en el espacio?",
    codigo: c`int x, cont = 0;
scanf("%d", &x);
while (x != -1) {
    ________;
    scanf("%d", &x);
}
printf("Leiste %d numeros", cont);`,
    opciones: ["cont += x", "cont++", "x++", "cont = x"],
    correcta: 1,
    explicacion: "Para contar se usa un contador que aumenta de 1 en 1. cont += x sería un acumulador: sumaría los valores en lugar de contarlos."
  },

  // ───────── Tema 9 · Ciclo para (for)
  {
    id: "fp-t9-1", tema: 9, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int i;
for (i = 10; i > 0; i -= 3)
    printf("%d,", i);`,
    opciones: ["10,7,4,", "10,7,4,1,", "7,4,1,", "10,7,4,1,-2,"],
    correcta: 1,
    explicacion: "i toma 10, 7, 4 y 1. Después vale -2 y -2 > 0 es falso, así que no se imprime."
  },
  {
    id: "fp-t9-2", tema: 9, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int i, cont = 0;
for (i = 0; i < 12; i += 2)
    cont++;
printf("%d %d", cont, i);`,
    opciones: ["6 12", "6 10", "12 12", "5 10"],
    correcta: 0,
    explicacion: "El ciclo corre con i = 0, 2, 4, 6, 8 y 10: 6 vueltas. Al salir, i ya vale 12."
  },
  {
    id: "fp-t9-3", tema: 9, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int i, p = 1;
for (i = 1; i <= 4; i++)
    p *= 2;
printf("%d", p);`,
    opciones: ["8", "32", "4", "16"],
    correcta: 3,
    explicacion: "p se multiplica por 2 cuatro veces: 2, 4, 8, 16. Es 2 elevado a la 4."
  },
  {
    id: "fp-t9-4", tema: 9, tipo: "error",
    pregunta: "Se quería imprimir 0 1 2 3 4, pero solo imprime 5. ¿Por qué?",
    codigo: c`int i;
for (i = 0; i < 5; i++);
    printf("%d ", i);`,
    opciones: ["La condición debe ser i <= 5", "i debe declararse dentro del for", "El punto y coma después del for termina el ciclo, así que el printf queda fuera", "Falta un break"],
    correcta: 2,
    explicacion: "El ; hace que el cuerpo del for sea una instrucción vacía. El ciclo da sus 5 vueltas sin hacer nada y luego el printf se ejecuta una vez, con i = 5."
  },
  {
    id: "fp-t9-5", tema: 9, tipo: "completa",
    pregunta: "Se quiere sumar los números pares del 2 al 100. ¿Qué va en el espacio?",
    codigo: c`int i, suma = 0;
for (i = 2; i <= 100; ________)
    suma += i;`,
    opciones: ["i++", "i += 2", "i *= 2", "i = 2"],
    correcta: 1,
    explicacion: "Empezando en 2 y avanzando de 2 en 2, i recorre solo los pares. Con i *= 2 recorrería 2, 4, 8, 16…"
  },
  {
    id: "fp-t9-6", tema: 9, tipo: "concepto",
    pregunta: "¿Cuál es el equivalente en C de este pseudocódigo?",
    codigo: c`Para i ← 1 Hasta 10 Hacer
  Escribir i
FinPara`,
    opciones: ["for (i = 1; i <= 10; i++)", "for (i = 1; i < 10; i++)", "for (i = 0; i <= 10; i++)", "for (i = 10; i >= 1; i++)"],
    correcta: 0,
    explicacion: "Hasta 10 incluye el 10, por eso la condición es i <= 10. Con i < 10 solo llegaría al 9."
  },

  // ───────── Tema 10 · Funciones con y sin retorno de valor
  {
    id: "fp-t10-1", tema: 10, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int doble(int x) {
    return x * 2;
}

int main() {
    int a = doble(3) + doble(4);
    printf("%d", a);
    return 0;
}`,
    opciones: ["14", "7", "24", "10"],
    correcta: 0,
    explicacion: "doble(3) regresa 6 y doble(4) regresa 8. La suma es 14."
  },
  {
    id: "fp-t10-2", tema: 10, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int x = 5;

void cambiar() {
    int x = 20;
    x++;
}

int main() {
    cambiar();
    printf("%d", x);
    return 0;
}`,
    opciones: ["21", "20", "6", "5"],
    correcta: 3,
    explicacion: "Dentro de cambiar se declara otra x, local, que oculta a la global. La x global nunca cambia y sigue valiendo 5."
  },
  {
    id: "fp-t10-3", tema: 10, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int contador = 0;

void sumar() {
    contador += 2;
}

int main() {
    sumar();
    sumar();
    sumar();
    printf("%d", contador);
    return 0;
}`,
    opciones: ["2", "0", "6", "3"],
    correcta: 2,
    explicacion: "contador es global, así que cada llamada modifica la misma variable: 0 + 2 + 2 + 2 = 6."
  },
  {
    id: "fp-t10-4", tema: 10, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`void incrementar(int n) {
    n = n + 10;
    printf("%d ", n);
}

int main() {
    int a = 5;
    incrementar(a);
    printf("%d", a);
    return 0;
}`,
    opciones: ["15 15", "15 5", "5 5", "5 15"],
    correcta: 1,
    explicacion: "La función recibe una copia del valor de a. n cambia a 15, pero a sigue valiendo 5 en main."
  },
  {
    id: "fp-t10-5", tema: 10, tipo: "error",
    pregunta: "Este programa marca error al compilar. ¿Cuál es la causa?",
    codigo: c`#include <stdio.h>

int main() {
    float r = promedio(8, 9);
    printf("%.1f", r);
    return 0;
}

float promedio(int a, int b) {
    return (a + b) / 2.0;
}`,
    opciones: ["Falta el prototipo de promedio antes de main", "Una función no puede regresar float", "Los parámetros deben ser float", "return no puede llevar operaciones"],
    correcta: 0,
    explicacion: "main usa promedio antes de que el compilador sepa que existe. Se arregla poniendo float promedio(int a, int b); antes de main, o definiendo la función arriba."
  },
  {
    id: "fp-t10-6", tema: 10, tipo: "completa",
    pregunta: "La función debe regresar el mayor de dos números. ¿Qué va en el espacio?",
    codigo: c`int mayor(int a, int b) {
    if (a > b)
        ________;
    return b;
}`,
    opciones: ["printf(\"%d\", a)", "a = b", "break", "return a"],
    correcta: 3,
    explicacion: "return a regresa el valor y termina la función. printf solo lo mostraría, sin regresarlo a quien llamó la función."
  }
];
