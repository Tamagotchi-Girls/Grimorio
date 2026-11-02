// 60 reactivos: 6 por tema.
// tipo: "concepto" | "imprime" | "error" | "completa"
// En los reactivos "imprime", la opción correcta es exactamente la salida del programa
// (verificado compilando con gcc: npm run verificar).
const c = String.raw;

export const PREGUNTAS = [
  // ───────── Tema 1 · Programación estructurada
  {
    id: "t1-1", tema: 1, tipo: "concepto",
    pregunta: "¿Cuáles son las tres estructuras básicas con las que se puede escribir cualquier programa estructurado?",
    opciones: ["Secuencia, selección e iteración", "Variables, funciones y clases", "Entrada, proceso y salida", "Herencia, encapsulamiento y polimorfismo"],
    correcta: 0,
    explicacion: "El teorema de Böhm-Jacopini dice que basta con secuencia (una instrucción tras otra), selección (if, switch) e iteración (ciclos). Herencia y clases son de programación orientada a objetos."
  },
  {
    id: "t1-2", tema: 1, tipo: "concepto",
    pregunta: "¿Qué instrucción se evita en programación estructurada porque rompe el flujo y vuelve el código difícil de seguir?",
    opciones: ["while", "goto", "printf", "#include"],
    correcta: 1,
    explicacion: "goto salta a cualquier parte del programa. Eso rompe la regla de una sola entrada y una sola salida por bloque, que es la base del paradigma."
  },
  {
    id: "t1-3", tema: 1, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a = 5, b = 2;
printf("%d %d", a / b, a % b);`,
    opciones: ["2.5 1", "2 1", "3 1", "2 0"],
    correcta: 1,
    explicacion: "Con enteros, 5 / 2 es división entera y da 2 (se descartan los decimales). 5 % 2 es el residuo: 1."
  },
  {
    id: "t1-4", tema: 1, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int x = 3;
x = x * 2 + 1;
x += 4;
printf("%d", x);`,
    opciones: ["7", "13", "11", "10"],
    correcta: 2,
    explicacion: "Primero x = 3 * 2 + 1 = 7 (la multiplicación va antes que la suma). Luego x += 4 deja x en 11."
  },
  {
    id: "t1-5", tema: 1, tipo: "error",
    pregunta: "Este programa compila, pero falla al leer la edad. ¿Cuál es el error?",
    codigo: c`int main() {
    int edad;
    printf("Edad: ");
    scanf("%d", edad);
    printf("Tienes %d años", edad);
    return 0;
}`,
    opciones: ["printf no acepta %d", "Falta el & antes de edad en scanf", "main debe ser void", "edad debe ser float"],
    correcta: 1,
    explicacion: "scanf necesita la dirección de la variable para guardar ahí el dato: scanf(\"%d\", &edad). Sin el &, escribe en una dirección inválida."
  },
  {
    id: "t1-6", tema: 1, tipo: "completa",
    pregunta: "¿Qué va en el espacio para que el programa imprima 8.5?",
    codigo: c`int suma = 17, n = 2;
float promedio;
promedio = ________;
printf("%.1f", promedio);`,
    opciones: ["suma / n", "(float)(suma / n)", "(float)suma / n", "suma % n"],
    correcta: 2,
    explicacion: "(float)suma convierte a suma en flotante antes de dividir, así la división conserva decimales: 8.5. En (float)(suma / n) la división entera ya dio 8 antes de convertir."
  },

  // ───────── Tema 2 · Estructuras de control anidadas
  {
    id: "t2-1", tema: 2, tipo: "concepto",
    pregunta: "¿Cuál es la diferencia principal entre while y do-while?",
    opciones: ["do-while ejecuta su bloque al menos una vez", "while ejecuta su bloque al menos una vez", "do-while no acepta condiciones compuestas", "No hay ninguna diferencia"],
    correcta: 0,
    explicacion: "do-while revisa la condición al final, así que el bloque corre al menos una vez. while la revisa antes de entrar y puede no ejecutarse nunca."
  },
  {
    id: "t2-2", tema: 2, tipo: "concepto",
    pregunta: "¿Qué hace break dentro de un ciclo?",
    opciones: ["Termina todo el programa", "Salta a la siguiente vuelta del ciclo", "Sale del ciclo más cercano", "Reinicia el ciclo desde el principio"],
    correcta: 2,
    explicacion: "break sale inmediatamente del ciclo (o switch) más cercano. Saltar a la siguiente vuelta es lo que hace continue."
  },
  {
    id: "t2-3", tema: 2, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= i; j++) {
        printf("*");
    }
    printf("\n");
}`,
    opciones: ["***\n**\n*", "*\n**\n***", "***\n***\n***", "*\n*\n*"],
    correcta: 1,
    explicacion: "El ciclo interno da i vueltas: 1 estrella en la primera línea, 2 en la segunda y 3 en la tercera."
  },
  {
    id: "t2-4", tema: 2, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int n = 7;
if (n > 5) {
    if (n % 2 == 0) printf("A");
    else printf("B");
} else {
    printf("C");
}`,
    opciones: ["A", "B", "C", "BC"],
    correcta: 1,
    explicacion: "7 > 5 es verdadero, así que entra al if externo. 7 % 2 es 1, no 0, así que toma el else interno e imprime B."
  },
  {
    id: "t2-5", tema: 2, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int op = 2;
switch (op) {
    case 1: printf("uno ");
    case 2: printf("dos ");
    case 3: printf("tres ");
        break;
    default: printf("otro");
}`,
    opciones: ["dos", "dos tres", "dos tres otro", "uno dos tres"],
    correcta: 1,
    explicacion: "Entra en case 2. Como no tiene break, sigue con case 3 y ahí el break lo saca del switch. Por eso imprime dos tres."
  },
  {
    id: "t2-6", tema: 2, tipo: "error",
    pregunta: "¿Qué problema tiene este ciclo?",
    codigo: c`int i = 0;
while (i < 5) {
    printf("%d ", i);
}`,
    opciones: ["while no acepta el operador <", "i nunca cambia, así que el ciclo es infinito", "printf no puede ir dentro de un ciclo", "i debe iniciar en 1"],
    correcta: 1,
    explicacion: "Falta i++ dentro del ciclo. Como i siempre vale 0, la condición i < 5 nunca se vuelve falsa."
  },

  // ───────── Tema 3 · Arreglos
  {
    id: "t3-1", tema: 3, tipo: "concepto",
    pregunta: "Si declaras int datos[10]; ¿cuáles son los índices válidos?",
    opciones: ["Del 1 al 10", "Del 0 al 10", "Del 0 al 9", "Del 1 al 9"],
    correcta: 2,
    explicacion: "Los arreglos en C empiezan en 0. Un arreglo de 10 elementos va de datos[0] a datos[9]."
  },
  {
    id: "t3-2", tema: 3, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int v[5] = {4, 8, 15, 16, 23};
int suma = 0;
for (int i = 0; i < 5; i += 2) {
    suma += v[i];
}
printf("%d", suma);`,
    opciones: ["66", "42", "24", "27"],
    correcta: 1,
    explicacion: "i toma los valores 0, 2 y 4. Suma v[0] + v[2] + v[4] = 4 + 15 + 23 = 42."
  },
  {
    id: "t3-3", tema: 3, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
printf("%d", m[1][2]);`,
    opciones: ["2", "5", "3", "6"],
    correcta: 3,
    explicacion: "m[1] es la segunda fila {4, 5, 6} y la posición [2] de esa fila es 6."
  },
  {
    id: "t3-4", tema: 3, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a[4] = {1, 2};
printf("%d %d", a[1], a[3]);`,
    opciones: ["2 0", "1 2", "2 y un valor basura", "Error de compilación"],
    correcta: 0,
    explicacion: "Cuando inicializas solo algunos elementos, el resto se llena con 0. a[1] es 2 y a[3] es 0."
  },
  {
    id: "t3-5", tema: 3, tipo: "error",
    pregunta: "Se quieren leer 5 calificaciones. ¿Qué está mal?",
    codigo: c`int calif[5];
for (int i = 1; i <= 5; i++) {
    scanf("%d", &calif[i]);
}`,
    opciones: ["Falta el & en scanf", "No se puede usar scanf con arreglos", "Escribe en calif[5], que está fuera del arreglo, y nunca usa calif[0]", "El arreglo debe declararse de tamaño 4"],
    correcta: 2,
    explicacion: "Los índices válidos son de 0 a 4. El ciclo debe ser for (i = 0; i < 5; i++)."
  },
  {
    id: "t3-6", tema: 3, tipo: "completa",
    pregunta: "Se quiere sumar todos los elementos de int m[3][4]. ¿Qué va en el espacio?",
    codigo: c`for (i = 0; i < 3; i++)
    for (j = 0; ________; j++)
        suma += m[i][j];`,
    opciones: ["j < 3", "j < 4", "j <= 4", "j < i"],
    correcta: 1,
    explicacion: "La matriz tiene 4 columnas, con índices de 0 a 3. El ciclo de columnas va mientras j < 4."
  },

  // ───────── Tema 4 · Programación modular
  {
    id: "t4-1", tema: 4, tipo: "concepto",
    pregunta: "¿Qué significa pasar un parámetro por valor?",
    opciones: ["La función recibe la dirección de la variable", "La función recibe una copia y los cambios no afectan la variable original", "La variable se vuelve global", "La función no puede usar el parámetro"],
    correcta: 1,
    explicacion: "Por valor, la función trabaja con una copia. Para modificar el original se pasa la dirección (por referencia)."
  },
  {
    id: "t4-2", tema: 4, tipo: "concepto",
    pregunta: "¿Qué es el prototipo de una función?",
    opciones: ["La primera versión de la función", "La declaración que indica tipo de retorno, nombre y parámetros antes de usarla", "Una función sin parámetros", "El valor que regresa la función"],
    correcta: 1,
    explicacion: "El prototipo, por ejemplo int suma(int a, int b);, le avisa al compilador cómo es la función antes de que aparezca su definición."
  },
  {
    id: "t4-3", tema: 4, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`void duplica(int x) {
    x = x * 2;
}

int main() {
    int n = 5;
    duplica(n);
    printf("%d", n);
    return 0;
}`,
    opciones: ["10", "5", "0", "Error de compilación"],
    correcta: 1,
    explicacion: "duplica recibe una copia de n. Duplica la copia, pero n en main sigue valiendo 5."
  },
  {
    id: "t4-4", tema: 4, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`void duplica(int *x) {
    *x = *x * 2;
}

int main() {
    int n = 5;
    duplica(&n);
    printf("%d", n);
    return 0;
}`,
    opciones: ["5", "10", "La dirección de n", "25"],
    correcta: 1,
    explicacion: "Ahora se manda la dirección de n. *x es la misma variable n, así que se modifica el original: 10."
  },
  {
    id: "t4-5", tema: 4, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`int f(int a, int b) {
    return a * 10 + b;
}

int main() {
    printf("%d", f(f(1, 2), 3));
    return 0;
}`,
    opciones: ["15", "123", "1203", "36"],
    correcta: 1,
    explicacion: "Primero se resuelve la llamada interna: f(1, 2) = 12. Luego f(12, 3) = 120 + 3 = 123."
  },
  {
    id: "t4-6", tema: 4, tipo: "error",
    pregunta: "La función debería regresar el cuadrado de n. ¿Qué le falta?",
    codigo: c`int cuadrado(int n) {
    int r = n * n;
}`,
    opciones: ["Un parámetro más", "La instrucción return r;", "Declararla como void", "Un printf"],
    correcta: 1,
    explicacion: "Una función int debe regresar un valor con return. Sin él, el valor que recibe quien la llama es indefinido."
  },

  // ───────── Tema 5 · Cadenas
  {
    id: "t5-1", tema: 5, tipo: "concepto",
    pregunta: "¿Para qué sirve el carácter '\\0' en un string?",
    opciones: ["Indica un salto de línea", "Marca el final de la cadena", "Representa el número cero", "Separa palabras"],
    correcta: 1,
    explicacion: "'\\0' (carácter nulo) marca dónde termina la cadena. Funciones como strlen y printf con %s se detienen al encontrarlo."
  },
  {
    id: "t5-2", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`char s[10] = "Hola";
printf("%d %d", (int)strlen(s), (int)sizeof(s));`,
    opciones: ["4 10", "5 10", "4 5", "10 10"],
    correcta: 0,
    explicacion: "strlen cuenta los caracteres antes de '\\0': 4. sizeof da el tamaño del arreglo declarado: 10."
  },
  {
    id: "t5-3", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`char a[] = "gato", b[] = "perro";
if (strcmp(a, b) < 0) printf("antes");
else printf("despues");`,
    opciones: ["antes", "despues", "0", "Error de compilación"],
    correcta: 0,
    explicacion: "strcmp regresa un número negativo cuando la primera cadena va antes en orden alfabético. \"gato\" va antes que \"perro\"."
  },
  {
    id: "t5-4", tema: 5, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`char s[20] = "Hola";
strcat(s, " C");
printf("%s %d", s, (int)strlen(s));`,
    opciones: ["Hola C 5", "Hola C 6", "HolaC 5", "Hola 4"],
    correcta: 1,
    explicacion: "strcat agrega \" C\" (espacio y C) al final: \"Hola C\". Son 6 caracteres: H, o, l, a, espacio y C."
  },
  {
    id: "t5-5", tema: 5, tipo: "error",
    pregunta: "¿Por qué este código no compila?",
    codigo: c`char nombre[20];
nombre = "Ana";`,
    opciones: ["\"Ana\" es muy corto", "Un arreglo no se puede asignar con =; se usa strcpy(nombre, \"Ana\")", "Falta el '\\0' al final de \"Ana\"", "nombre debe ser de tamaño 3"],
    correcta: 1,
    explicacion: "Los arreglos no se asignan con =. Para copiar un string se usa strcpy, o se inicializa al declarar: char nombre[20] = \"Ana\";"
  },
  {
    id: "t5-6", tema: 5, tipo: "completa",
    pregunta: "Para contar las letras de s sin usar strlen, ¿qué va en el espacio?",
    codigo: c`int i = 0;
while (s[i] != ________) {
    i++;
}
printf("%d", i);`,
    opciones: ["'\\n'", "' '", "'\\0'", "\"\\0\""],
    correcta: 2,
    explicacion: "La cadena termina en '\\0'. Se compara contra el carácter (comillas simples), no contra el string \"\\0\"."
  },

  // ───────── Tema 6 · Registros
  {
    id: "t6-1", tema: 6, tipo: "concepto",
    pregunta: "¿Qué es un struct en C?",
    opciones: ["Un arreglo donde todos los elementos son del mismo tipo", "Un tipo que agrupa variables de distintos tipos bajo un mismo nombre", "Una función que regresa varios valores", "Una librería de C"],
    correcta: 1,
    explicacion: "Un struct (registro) agrupa campos que pueden ser de distinto tipo, como nombre (char[]) y edad (int)."
  },
  {
    id: "t6-2", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`struct Alumno {
    char nombre[20];
    int edad;
};
struct Alumno a = {"Luis", 19};
a.edad++;
printf("%s %d", a.nombre, a.edad);`,
    opciones: ["Luis 19", "Luis 20", "20 Luis", "Error de compilación"],
    correcta: 1,
    explicacion: "a.edad++ incrementa solo el campo edad de 19 a 20."
  },
  {
    id: "t6-3", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`struct Punto { int x, y; };
struct Punto p[3] = {{1, 2}, {3, 4}, {5, 6}};
int s = 0;
for (int i = 0; i < 3; i++) {
    s += p[i].y;
}
printf("%d", s);`,
    opciones: ["9", "21", "12", "6"],
    correcta: 2,
    explicacion: "Suma solo el campo y de cada punto: 2 + 4 + 6 = 12."
  },
  {
    id: "t6-4", tema: 6, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`struct Punto { int x, y; };
struct Punto a = {1, 2}, b;
b = a;
b.x = 9;
printf("%d %d", a.x, b.x);`,
    opciones: ["9 9", "1 9", "1 1", "9 1"],
    correcta: 1,
    explicacion: "b = a copia los campos. Después son independientes: cambiar b.x no afecta a a.x."
  },
  {
    id: "t6-5", tema: 6, tipo: "error",
    pregunta: "¿Por qué no compila esta declaración?",
    codigo: c`struct Libro {
    char titulo[30];
    int paginas;
}

int main() {
    struct Libro l;
    return 0;
}`,
    opciones: ["Falta el punto y coma después de la llave que cierra el struct", "Los campos no pueden ser arreglos", "struct se escribe con mayúscula", "Falta inicializar l"],
    correcta: 0,
    explicacion: "La declaración de un struct termina con }; Sin el punto y coma el compilador marca error."
  },
  {
    id: "t6-6", tema: 6, tipo: "completa",
    pregunta: "p apunta a un struct Alumno. ¿Cómo se imprime su edad?",
    codigo: c`struct Alumno a = {"Luis", 19};
struct Alumno *p = &a;
printf("%d", ________);`,
    opciones: ["p.edad", "*p.edad", "p->edad", "&p->edad"],
    correcta: 2,
    explicacion: "Con un apuntador a struct se usa la flecha: p->edad, que equivale a (*p).edad. *p.edad no funciona porque el punto se evalúa antes que el *."
  },

  // ───────── Tema 7 · Apuntadores y memoria dinámica
  {
    id: "t7-1", tema: 7, tipo: "concepto",
    pregunta: "¿Qué guarda una variable de tipo apuntador?",
    opciones: ["Un valor entero cualquiera", "La dirección de memoria de otra variable", "Una copia de otra variable", "El tamaño de una variable"],
    correcta: 1,
    explicacion: "Un apuntador guarda una dirección. Con * se accede al valor que está en esa dirección."
  },
  {
    id: "t7-2", tema: 7, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int a = 10;
int *p = &a;
*p = 25;
printf("%d", a);`,
    opciones: ["10", "25", "La dirección de a", "35"],
    correcta: 1,
    explicacion: "p apunta a a. Escribir *p = 25 cambia el valor de a directamente."
  },
  {
    id: "t7-3", tema: 7, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int v[4] = {10, 20, 30, 40};
int *p = v;
p += 2;
printf("%d %d", *p, *(p + 1));`,
    opciones: ["12 13", "20 30", "30 40", "10 20"],
    correcta: 2,
    explicacion: "p empieza en v[0]. p += 2 lo mueve a v[2], que vale 30, y *(p + 1) es v[3], que vale 40."
  },
  {
    id: "t7-4", tema: 7, tipo: "concepto",
    pregunta: "¿Qué hace int *v = malloc(5 * sizeof(int));?",
    opciones: ["Crea 5 variables llamadas v", "Reserva memoria para 5 enteros y guarda en v la dirección del inicio", "Libera memoria de 5 enteros", "Inicializa 5 enteros en cero"],
    correcta: 1,
    explicacion: "malloc reserva el número de bytes indicado y regresa un apuntador al inicio, o NULL si no hay memoria. No inicializa los valores."
  },
  {
    id: "t7-5", tema: 7, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`int *p = malloc(3 * sizeof(int));
for (int i = 0; i < 3; i++) {
    p[i] = (i + 1) * 5;
}
printf("%d", p[0] + p[2]);
free(p);`,
    opciones: ["15", "20", "10", "30"],
    correcta: 1,
    explicacion: "El arreglo queda {5, 10, 15}. p[0] + p[2] = 5 + 15 = 20."
  },
  {
    id: "t7-6", tema: 7, tipo: "error",
    pregunta: "Este programa funciona, pero tiene un problema de manejo de memoria. ¿Cuál?",
    codigo: c`int main() {
    int *v = malloc(100 * sizeof(int));
    for (int i = 0; i < 100; i++) v[i] = i;
    printf("%d", v[99]);
    return 0;
}`,
    opciones: ["No se puede usar v[i] con un apuntador", "Nunca se llama free(v), así que hay una fuga de memoria", "malloc no acepta sizeof", "v debería ser int v[100]"],
    correcta: 1,
    explicacion: "Toda memoria reservada con malloc debe liberarse con free(v). También conviene revisar que v no sea NULL antes de usarlo."
  },

  // ───────── Tema 8 · Funciones con datos estructurados
  {
    id: "t8-1", tema: 8, tipo: "concepto",
    pregunta: "Cuando pasas un arreglo a una función en C, ¿qué recibe la función?",
    opciones: ["Una copia completa del arreglo", "La dirección del primer elemento, así que puede modificar el original", "Solo el primer elemento", "El tamaño del arreglo"],
    correcta: 1,
    explicacion: "Los arreglos siempre se pasan como apuntador a su primer elemento. Los cambios dentro de la función se ven fuera."
  },
  {
    id: "t8-2", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`void llenar(int v[], int n) {
    for (int i = 0; i < n; i++) {
        v[i] = i * i;
    }
}

int main() {
    int a[4];
    llenar(a, 4);
    printf("%d", a[3]);
    return 0;
}`,
    opciones: ["3", "16", "9", "Un valor basura"],
    correcta: 2,
    explicacion: "La función modifica el arreglo original. a[3] = 3 * 3 = 9."
  },
  {
    id: "t8-3", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`int suma(int *v, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += v[i];
    return s;
}

int main() {
    int a[] = {2, 4, 6, 8};
    printf("%d", suma(a + 1, 2));
    return 0;
}`,
    opciones: ["6", "10", "12", "20"],
    correcta: 1,
    explicacion: "a + 1 apunta a a[1]. La función suma 2 elementos desde ahí: 4 + 6 = 10."
  },
  {
    id: "t8-4", tema: 8, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`struct Cuenta { int saldo; };

void depositaA(struct Cuenta c) { c.saldo += 100; }
void depositaB(struct Cuenta *c) { c->saldo += 100; }

int main() {
    struct Cuenta c = {50};
    depositaA(c);
    depositaB(&c);
    printf("%d", c.saldo);
    return 0;
}`,
    opciones: ["50", "150", "250", "200"],
    correcta: 1,
    explicacion: "depositaA recibe una copia, así que no cambia el original. depositaB recibe la dirección y sí lo modifica: 50 + 100 = 150."
  },
  {
    id: "t8-5", tema: 8, tipo: "error",
    pregunta: "Se quiere saber cuántos elementos tiene el arreglo dentro de la función. ¿Cuál es el problema?",
    codigo: c`float promedio(int v[]) {
    int n = sizeof(v) / sizeof(v[0]);
    int s = 0;
    for (int i = 0; i < n; i++) s += v[i];
    return (float)s / n;
}`,
    opciones: ["sizeof no funciona con int", "Dentro de la función v es un apuntador, así que sizeof(v) no da el tamaño del arreglo; hay que recibir n como parámetro", "Falta inicializar s", "La función debe regresar int"],
    correcta: 1,
    explicacion: "Al pasar un arreglo se pierde su tamaño: sizeof(v) da el tamaño de un apuntador. Por eso las funciones reciben n aparte."
  },
  {
    id: "t8-6", tema: 8, tipo: "completa",
    pregunta: "¿Cuál es el parámetro correcto para una función que recibe una matriz de 3 columnas?",
    codigo: c`void imprime(________, int filas) {
    for (int i = 0; i < filas; i++)
        for (int j = 0; j < 3; j++)
            printf("%d ", m[i][j]);
}`,
    opciones: ["int m[][]", "int m[][3]", "int m[3][]", "int m"],
    correcta: 1,
    explicacion: "Para matrices, C necesita saber cuántas columnas hay para calcular las posiciones. La primera dimensión puede omitirse: int m[][3]."
  },

  // ───────── Tema 9 · Recursión
  {
    id: "t9-1", tema: 9, tipo: "concepto",
    pregunta: "En una función recursiva, ¿qué es el caso base?",
    opciones: ["La primera línea de la función", "La condición que detiene las llamadas recursivas", "La llamada que hace main", "El valor del parámetro inicial"],
    correcta: 1,
    explicacion: "El caso base resuelve directamente el problema más pequeño, sin volver a llamar a la función. Sin él, las llamadas nunca terminan."
  },
  {
    id: "t9-2", tema: 9, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`int f(int n) {
    if (n == 0) return 0;
    return n + f(n - 1);
}

int main() {
    printf("%d", f(4));
    return 0;
}`,
    opciones: ["4", "10", "24", "0"],
    correcta: 1,
    explicacion: "f(4) = 4 + f(3) = 4 + 3 + f(2) = 4 + 3 + 2 + 1 + f(0) = 10."
  },
  {
    id: "t9-3", tema: 9, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente programa?",
    codigo: c`void cuenta(int n) {
    if (n == 0) return;
    printf("%d ", n);
    cuenta(n - 1);
}

int main() {
    cuenta(3);
    return 0;
}`,
    opciones: ["1 2 3", "3 2 1", "3 2 1 0", "0 1 2 3"],
    correcta: 1,
    explicacion: "printf va antes de la llamada recursiva, así que imprime de ida: 3, luego 2, luego 1. Con n = 0 solo regresa."
  },
  {
    id: "t9-4", tema: 9, tipo: "imprime",
    pregunta: "Igual que el anterior, pero con el printf después de la llamada. ¿Qué imprime?",
    codigo: c`void cuenta(int n) {
    if (n == 0) return;
    cuenta(n - 1);
    printf("%d ", n);
}

int main() {
    cuenta(3);
    return 0;
}`,
    opciones: ["3 2 1", "1 2 3", "0 1 2 3", "No imprime nada"],
    correcta: 1,
    explicacion: "Primero se hacen todas las llamadas hasta n = 0. Los printf se ejecutan de regreso: primero el de n = 1, luego 2 y luego 3."
  },
  {
    id: "t9-5", tema: 9, tipo: "error",
    pregunta: "¿Qué problema tiene esta función?",
    codigo: c`int factorial(int n) {
    return n * factorial(n - 1);
}`,
    opciones: ["Debería usar un for", "No tiene caso base, así que las llamadas nunca terminan", "n debe ser float", "No puede llamarse a sí misma"],
    correcta: 1,
    explicacion: "Falta algo como if (n <= 1) return 1; Sin caso base, la función se llama infinitamente hasta que el programa truena."
  },
  {
    id: "t9-6", tema: 9, tipo: "concepto",
    pregunta: "Con esta función, ¿cuántas veces se ejecuta pot en total al llamar pot(2, 5), contando la primera llamada?",
    codigo: c`int pot(int b, int e) {
    if (e == 0) return 1;
    return b * pot(b, e - 1);
}`,
    opciones: ["5", "6", "2", "32"],
    correcta: 1,
    explicacion: "Se llama con e = 5, 4, 3, 2, 1 y 0. Son 6 llamadas; la de e = 0 es el caso base. El resultado es 32, pero eso no es el número de llamadas."
  },

  // ───────── Tema 10 · Archivos
  {
    id: "t10-1", tema: 10, tipo: "concepto",
    pregunta: "¿Qué modo de fopen abre un archivo para escribir y borra lo que tenía antes?",
    opciones: ["\"r\"", "\"w\"", "\"a\"", "\"r+\""],
    correcta: 1,
    explicacion: "\"w\" crea el archivo o lo vacía si ya existía. \"a\" agrega al final sin borrar y \"r\" solo lee."
  },
  {
    id: "t10-2", tema: 10, tipo: "concepto",
    pregunta: "¿Qué regresa fopen si no puede abrir el archivo?",
    opciones: ["-1", "EOF", "NULL", "Una cadena vacía"],
    correcta: 2,
    explicacion: "fopen regresa NULL cuando falla (por ejemplo, si el archivo no existe en modo \"r\"). Siempre hay que revisarlo."
  },
  {
    id: "t10-3", tema: 10, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`FILE *f = fopen("datos.txt", "w");
fprintf(f, "%d %d", 7, 3);
fclose(f);

f = fopen("datos.txt", "r");
int a, b;
fscanf(f, "%d %d", &a, &b);
fclose(f);
printf("%d", a + b);`,
    opciones: ["73", "10", "7 3", "0"],
    correcta: 1,
    explicacion: "Se escriben 7 y 3 en el archivo, se vuelven a leer como enteros y se suman: 10."
  },
  {
    id: "t10-4", tema: 10, tipo: "imprime",
    pregunta: "¿Qué imprime el siguiente código?",
    codigo: c`FILE *f = fopen("log.txt", "w");
fprintf(f, "A");
fclose(f);

f = fopen("log.txt", "a");
fprintf(f, "B");
fclose(f);

char s[10];
f = fopen("log.txt", "r");
fscanf(f, "%s", s);
fclose(f);
printf("%s", s);`,
    opciones: ["B", "A", "AB", "BA"],
    correcta: 2,
    explicacion: "Con \"w\" queda \"A\". Con \"a\" se agrega \"B\" al final sin borrar, así que el archivo queda \"AB\"."
  },
  {
    id: "t10-5", tema: 10, tipo: "error",
    pregunta: "¿Qué falta en este código para que sea seguro?",
    codigo: c`FILE *f = fopen("notas.txt", "r");
int n;
fscanf(f, "%d", &n);
printf("%d", n);
fclose(f);`,
    opciones: ["Usar \"w\" en vez de \"r\"", "Revisar que f no sea NULL antes de leer", "Cambiar fscanf por scanf", "Cerrar el archivo antes de leer"],
    correcta: 1,
    explicacion: "Si notas.txt no existe, fopen regresa NULL y fscanf(NULL, ...) hace que el programa truene. Hay que validar con if (f == NULL)."
  },
  {
    id: "t10-6", tema: 10, tipo: "completa",
    pregunta: "Se quieren sumar todos los números de un archivo. ¿Qué va en el espacio?",
    codigo: c`int x, suma = 0;
while (fscanf(f, "%d", &x) == ________) {
    suma += x;
}`,
    opciones: ["0", "1", "EOF", "NULL"],
    correcta: 1,
    explicacion: "fscanf regresa cuántos datos leyó. Mientras lea 1 número, se suma. Al terminar el archivo regresa EOF y el ciclo se detiene."
  }
];
