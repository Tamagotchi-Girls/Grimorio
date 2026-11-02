// Los 10 contenidos del programa de Programación Estructurada (IL352, CUCEI).
// Cada tema trae apuntes breves para repasar antes de practicar.
const c = String.raw;

export const TEMAS = [
  {
    id: 1,
    nombre: "Programación estructurada",
    corto: "Paradigma",
    apuntes: [
      "Todo programa se puede escribir con solo tres estructuras: secuencia, selección (if, switch) e iteración (while, do-while, for).",
      "Cada bloque tiene una sola entrada y una sola salida. Por eso se evita goto.",
      "La división entera descarta decimales: 7 / 2 da 3. El operador % da el residuo: 7 % 2 da 1.",
      "Para obtener decimales, al menos un operando debe ser float o double, por ejemplo con un cast: (float)a / b."
    ],
    ejemplo: c`int a = 7, b = 2;
printf("%d %d %.1f", a / b, a % b, (float)a / b);
// imprime: 3 1 3.5`
  },
  {
    id: 2,
    nombre: "Estructuras de control anidadas",
    corto: "Control",
    apuntes: [
      "while revisa la condición antes de entrar; do-while entra al menos una vez y revisa al final.",
      "En un for anidado, el ciclo interno completa todas sus vueltas por cada vuelta del externo.",
      "En switch, si un case no termina con break, la ejecución sigue con el siguiente case.",
      "break sale del ciclo o switch más cercano; continue salta a la siguiente vuelta del ciclo."
    ],
    ejemplo: c`for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 2; j++)
        printf("(%d,%d) ", i, j);
}
// 6 pares: el interno da 2 vueltas por cada i`
  },
  {
    id: 3,
    nombre: "Arreglos unidimensionales y bidimensionales",
    corto: "Arreglos",
    apuntes: [
      "Un arreglo de tamaño N tiene índices de 0 a N-1. Usar el índice N se sale del arreglo.",
      "Si inicializas solo algunos elementos, el resto queda en 0: int a[5] = {1, 2}; deja a[2], a[3] y a[4] en 0.",
      "En una matriz m[filas][columnas], el primer índice es la fila y el segundo la columna.",
      "Para recorrer una matriz se usan dos ciclos: uno para filas y otro para columnas."
    ],
    ejemplo: c`int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
for (int i = 0; i < 2; i++)
    for (int j = 0; j < 3; j++)
        printf("%d ", m[i][j]);
// 1 2 3 4 5 6`
  },
  {
    id: 4,
    nombre: "Programación modular",
    corto: "Funciones",
    apuntes: [
      "Una función agrupa un bloque de código con un nombre, recibe parámetros y puede regresar un valor con return.",
      "El prototipo declara la función antes de usarla: tipo de retorno, nombre y tipos de parámetros.",
      "Paso por valor: la función recibe una copia. Cambiarla no afecta la variable original.",
      "Paso por referencia: se manda la dirección (&n) y la función usa un apuntador (*x) para modificar el original."
    ],
    ejemplo: c`void intercambia(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}
// uso: intercambia(&x, &y);`
  },
  {
    id: 5,
    nombre: "Caracteres y cadenas de caracteres",
    corto: "Strings",
    apuntes: [
      "Un string en C es un arreglo de char que termina con el carácter nulo '\\0'.",
      "\"Hola\" ocupa 5 casillas: 4 letras más '\\0'. strlen cuenta 4; sizeof cuenta el tamaño del arreglo.",
      "No se puede asignar un string con =. Se usa strcpy(destino, origen).",
      "strcmp regresa 0 si son iguales, negativo si el primero va antes en orden alfabético y positivo si va después."
    ],
    ejemplo: c`char s[20];
strcpy(s, "Hola");
strcat(s, " mundo");
printf("%s (%d)", s, (int)strlen(s));
// Hola mundo (10)`
  },
  {
    id: 6,
    nombre: "Registros (struct)",
    corto: "Registros",
    apuntes: [
      "Un struct agrupa variables de distintos tipos bajo un mismo nombre. Cada variable es un campo.",
      "La declaración del struct termina con punto y coma después de la llave de cierre.",
      "Se accede a un campo con punto: a.edad. Con un apuntador se usa flecha: p->edad, que es lo mismo que (*p).edad.",
      "Asignar un struct a otro (b = a) copia todos sus campos; después son independientes."
    ],
    ejemplo: c`struct Alumno {
    char nombre[20];
    int edad;
};
struct Alumno a = {"Ana", 19};
printf("%s tiene %d", a.nombre, a.edad);`
  },
  {
    id: 7,
    nombre: "Apuntadores y memoria dinámica",
    corto: "Apuntadores",
    apuntes: [
      "Un apuntador guarda una dirección de memoria. &a da la dirección de a; *p da el valor guardado en esa dirección.",
      "El nombre de un arreglo funciona como apuntador a su primer elemento: v es lo mismo que &v[0], y *(v + i) es v[i].",
      "malloc(n * sizeof(tipo)) reserva memoria en tiempo de ejecución y regresa un apuntador, o NULL si no pudo.",
      "Toda memoria pedida con malloc se libera con free cuando ya no se usa. Si no, hay una fuga de memoria."
    ],
    ejemplo: c`int n = 5;
int *v = malloc(n * sizeof(int));
if (v == NULL) return 1;
for (int i = 0; i < n; i++) v[i] = i * 2;
free(v);`
  },
  {
    id: 8,
    nombre: "Funciones con datos estructurados",
    corto: "Parámetros",
    apuntes: [
      "Un arreglo siempre se pasa como la dirección de su primer elemento, así que la función puede modificar el original.",
      "Dentro de la función, el arreglo es un apuntador: sizeof ya no da su tamaño. Por eso se manda n como parámetro.",
      "Para una matriz hay que indicar las columnas en el parámetro: int m[][3].",
      "Un struct se pasa por valor (copia) o por referencia con apuntador (struct T *p) para modificarlo."
    ],
    ejemplo: c`int suma(int v[], int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += v[i];
    return s;
}`
  },
  {
    id: 9,
    nombre: "Funciones recursivas",
    corto: "Recursión",
    apuntes: [
      "Una función recursiva se llama a sí misma con un problema más pequeño.",
      "El caso base es la condición que detiene las llamadas. Sin él, la función nunca termina.",
      "El caso recursivo reduce el problema y acerca la ejecución al caso base.",
      "Lo que va antes de la llamada recursiva se ejecuta de ida; lo que va después se ejecuta de regreso."
    ],
    ejemplo: c`int factorial(int n) {
    if (n <= 1) return 1;        // caso base
    return n * factorial(n - 1); // caso recursivo
}
// factorial(4) = 4 * 3 * 2 * 1 = 24`
  },
  {
    id: 10,
    nombre: "Almacenamiento en memoria secundaria",
    corto: "Archivos",
    apuntes: [
      "Un archivo se abre con fopen(nombre, modo) y regresa un FILE *, o NULL si no se pudo abrir.",
      "Modos: \"r\" lee, \"w\" escribe borrando lo anterior, \"a\" agrega al final sin borrar.",
      "fprintf y fscanf funcionan como printf y scanf, pero con el archivo como primer parámetro.",
      "Siempre se cierra con fclose. fscanf regresa cuántos datos leyó, o EOF al llegar al final."
    ],
    ejemplo: c`FILE *f = fopen("notas.txt", "r");
if (f == NULL) {
    printf("No se pudo abrir");
    return 1;
}
int x, suma = 0;
while (fscanf(f, "%d", &x) == 1) suma += x;
fclose(f);`
  }
];
