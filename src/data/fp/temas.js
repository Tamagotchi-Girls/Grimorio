// Fundamentos de Programación: 10 temas con apuntes breves para repasar antes de practicar.
const c = String.raw;

export const TEMAS = [
  {
    id: 1,
    nombre: "La computadora y los sistemas numéricos",
    corto: "Sistemas",
    apuntes: [
      "La computadora solo entiende lenguaje máquina (binario: 0 y 1). El ensamblador usa abreviaturas como MOV o ADD, y los lenguajes de alto nivel como C se parecen al lenguaje humano y se traducen con un compilador.",
      "Modelo de Von Neumann: CPU (unidad de control + unidad aritmético-lógica), memoria que guarda datos e instrucciones juntos, y dispositivos de entrada y salida.",
      "Para pasar de decimal a binario se divide entre 2 y se leen los residuos de abajo hacia arriba: 13 → 1101.",
      "Cada dígito octal equivale a 3 bits y cada dígito hexadecimal a 4 bits: 1010 1111 en binario es AF en hexadecimal; 101 011 es 53 en octal."
    ],
    ejemplo: c`Binario a decimal: 1011
1·8 + 0·4 + 1·2 + 1·1 = 11

Decimal 26 a hexadecimal:
26 / 16 = 1 residuo 10 (A)  →  1A`
  },
  {
    id: 2,
    nombre: "Algoritmos y proceso de programación",
    corto: "Algoritmos",
    apuntes: [
      "Un algoritmo es una serie de pasos ordenados para resolver un problema. Debe ser preciso (sin ambigüedad), definido (mismo resultado con los mismos datos) y finito (termina).",
      "Todo algoritmo tiene tres partes: entrada (los datos), proceso (los cálculos) y salida (el resultado).",
      "Fases para programar: definición del problema, análisis, diseño (algoritmo), codificación, prueba (incluye la corrida de escritorio) y mantenimiento.",
      "La programación estructurada es un paradigma que resuelve todo con secuencia, selección y repetición, sin saltos como goto."
    ],
    ejemplo: c`Problema: promedio de 3 calificaciones
Entrada: c1, c2, c3
Proceso: prom = (c1 + c2 + c3) / 3
Salida:  prom`
  },
  {
    id: 3,
    nombre: "Diagramas de flujo y pseudocódigo",
    corto: "Diagramas",
    apuntes: [
      "Símbolos del diagrama de flujo: óvalo = inicio/fin, rectángulo = proceso, paralelogramo = entrada o salida de datos, rombo = decisión, flechas = sentido del flujo.",
      "El rombo tiene una entrada y dos salidas: verdadero y falso. Se usa en las selecciones y en las condiciones de los ciclos.",
      "El pseudocódigo describe el algoritmo con palabras clave en español: Inicio, Leer, Escribir, Si…Entonces…Sino, Mientras, Hacer…Mientras, Para, Fin.",
      "La corrida (prueba) de escritorio consiste en seguir el algoritmo a mano, anotando en una tabla cómo cambia cada variable."
    ],
    ejemplo: c`Inicio
  Leer n
  Si n mod 2 = 0 Entonces
    Escribir "Par"
  Sino
    Escribir "Impar"
  FinSi
Fin`
  },
  {
    id: 4,
    nombre: "Lenguaje C: tipos de datos, variables y constantes",
    corto: "Datos",
    apuntes: [
      "C fue creado por Dennis Ritchie en los Laboratorios Bell a inicios de los años 70. Es un lenguaje compilado, de propósito general y estructurado.",
      "Tipos básicos: int (enteros), float y double (reales) y char (un carácter, entre comillas simples: 'A'). Una variable es un espacio de memoria con nombre cuyo valor puede cambiar.",
      "Una constante no cambia durante la ejecución: #define PI 3.1416 o const float PI = 3.1416;. Las palabras reservadas (int, if, while, return…) no pueden usarse como nombres.",
      "Comentarios: // para una línea y /* … */ para varias. Bibliotecas: stdio.h (printf, scanf), math.h (sqrt, pow) y stdlib.h (rand, system, exit)."
    ],
    ejemplo: c`#include <stdio.h>
#define PI 3.1416   // constante simbólica

int main() {
    int radio = 2;          /* variable entera */
    float area = PI * radio * radio;
    printf("%.2f", area);   // imprime 12.57
    return 0;
}`
  },
  {
    id: 5,
    nombre: "Operadores y expresiones",
    corto: "Operadores",
    apuntes: [
      "Aritméticos: + - * / y % (residuo, solo con enteros). Entre enteros, / descarta los decimales: 7 / 2 da 3.",
      "Relacionales: == != < > <= >=. Dan 1 (verdadero) o 0 (falso). No confundas = (asignación) con == (comparación).",
      "Lógicos: && (y), || (o), ! (no). Asignación: =, +=, -=, *=, /=. Incremento y decremento: ++ y --.",
      "Precedencia: primero () , luego ! ++ --, después * / %, luego + -, después relacionales, luego && y al final ||."
    ],
    ejemplo: c`int a = 7, b = 2;
printf("%d %d %d", a / b, a % b, a > b && b > 5);
// imprime: 3 1 0`
  },
  {
    id: 6,
    nombre: "Estructura secuencial y entrada/salida",
    corto: "Secuencial",
    apuntes: [
      "En la estructura secuencial las instrucciones se ejecutan una tras otra, en el orden en que están escritas.",
      "printf muestra datos. Especificadores: %d entero, %f real (float), %lf double en scanf, %c carácter, %s cadena. %.2f muestra 2 decimales.",
      "scanf lee datos y necesita la dirección de la variable: scanf(\"%d\", &edad);. Sin el & el programa falla.",
      "Secuencias de escape: \\n salto de línea, \\t tabulador."
    ],
    ejemplo: c`int base, altura;
printf("Base y altura: ");
scanf("%d %d", &base, &altura);
printf("Area = %.1f\n", base * altura / 2.0);`
  },
  {
    id: 7,
    nombre: "Estructuras selectivas: simple, doble y múltiple",
    corto: "Selección",
    apuntes: [
      "Simple (if): ejecuta un bloque solo si la condición es verdadera. Doble (if-else): un bloque si es verdadera y otro si es falsa.",
      "Múltiple: if-else if-else revisa condiciones en orden y ejecuta solo la primera verdadera. switch compara una variable entera o char contra valores constantes (case).",
      "En switch, cada case debe terminar con break; si no, la ejecución continúa con el siguiente case. default se ejecuta si ningún case coincide.",
      "Sin llaves, el if solo controla la siguiente instrucción. En C, cualquier valor distinto de 0 es verdadero."
    ],
    ejemplo: c`if (calif >= 90)
    printf("Excelente");
else if (calif >= 60)
    printf("Aprobado");
else
    printf("Reprobado");`
  },
  {
    id: 8,
    nombre: "Ciclos mientras y hacer-mientras",
    corto: "Mientras",
    apuntes: [
      "while (mientras) revisa la condición antes de cada vuelta: puede ejecutarse 0 veces.",
      "do-while (hacer-mientras) ejecuta el bloque y revisa la condición al final: siempre se ejecuta al menos una vez. Lleva punto y coma después del while.",
      "Contador: variable que aumenta en una cantidad fija (cont++). Acumulador: variable que suma valores variables (suma += x). Ambos se inicializan antes del ciclo, normalmente en 0.",
      "Bandera: variable que indica si algo ocurrió (0 o 1). Si la condición nunca se vuelve falsa, el ciclo es infinito."
    ],
    ejemplo: c`int n, suma = 0, cont = 0;
do {
    scanf("%d", &n);
    if (n > 0) { suma += n; cont++; }
} while (n != 0);   // termina al leer 0`
  },
  {
    id: 9,
    nombre: "Ciclo para (for)",
    corto: "Para",
    apuntes: [
      "for (inicialización; condición; incremento) junta en una línea las tres partes de un ciclo controlado por contador.",
      "Orden de ejecución: inicialización (una vez) → condición → cuerpo → incremento → condición → … hasta que la condición sea falsa.",
      "En pseudocódigo se escribe: Para i ← 1 Hasta 10 Hacer … FinPara (también llamado ciclo desde).",
      "for (i = 0; i < n; i++) da n vueltas. Cualquier for se puede reescribir como while."
    ],
    ejemplo: c`int i, fact = 1;
for (i = 1; i <= 5; i++)
    fact *= i;
printf("%d", fact);   // 120`
  },
  {
    id: 10,
    nombre: "Funciones con y sin retorno de valor",
    corto: "Funciones",
    apuntes: [
      "La programación modular divide un programa en funciones: bloques con nombre que hacen una tarea y se pueden llamar varias veces.",
      "Una función void no regresa valor. Una función con tipo (int, float…) regresa un valor con return. El prototipo se escribe antes de main cuando la función se define después.",
      "Funciones predefinidas: vienen en las bibliotecas (sqrt, pow, printf). Funciones definidas por el programador: las que escribes tú.",
      "Variable local: se declara dentro de una función y solo existe ahí. Variable global: se declara fuera de todas las funciones y todas pueden usarla."
    ],
    ejemplo: c`int cuadrado(int x);          // prototipo

int main() {
    printf("%d", cuadrado(4));  // 16
    return 0;
}

int cuadrado(int x) {
    return x * x;
}`
  }
];
