export type QuestionType = "quiz" | "code" | "fill" | "order";

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  hint?: string;
  explanation: string;
  // quiz
  options?: QuizOption[];
  // code
  codeTemplate?: string;
  expectedOutput?: string;
  testCode?: string;
  // fill (fill in the blank)
  fillTemplate?: string; // text with ___ for blanks
  correctFill?: string[];
  // order (arrange lines)
  orderLines?: string[];
  correctOrder?: number[];
  xp: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  theory: string;
  codeExample?: string;
  questions: Question[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  color: string;
  accent: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  lessons: Lesson[];
}

export const curriculum: Chapter[] = [
  {
    id: "basics",
    title: "Podstawy Pythona",
    description: "Zmienne, typy danych i pierwsze kroki",
    color: "#10b981",
    accent: "#059669",
    level: "beginner",
    icon: "🐣",
    lessons: [
      {
        id: "hello-world",
        title: "Witaj, świecie!",
        description: "Twój pierwszy program w Pythonie",
        icon: "👋",
        theory: `Python to jeden z najpopularniejszych języków programowania na świecie. Jest prosty, czytelny i potężny.

Funkcja **print()** wyświetla tekst na ekranie. To będzie Twoje pierwsze narzędzie!

Tekst w Pythonie zawsze ujmujemy w cudzysłów: **"tekst"** lub **'tekst'**.`,
        codeExample: `print("Witaj, świecie!")
print("Python jest super!")
print(2 + 2)`,
        questions: [
          {
            id: "hw-q1",
            type: "quiz",
            prompt: "Co wyświetli poniższy kod?\n\nprint('Python')",
            explanation: "Funkcja print() wyświetla dokładnie to, co jest w nawiasach.",
            options: [
              { id: "a", text: "python", correct: false },
              { id: "b", text: "Python", correct: true },
              { id: "c", text: "'Python'", correct: false },
              { id: "d", text: "print(Python)", correct: false },
            ],
            xp: 10,
          },
          {
            id: "hw-q2",
            type: "fill",
            prompt: "Uzupełnij kod tak, aby wyświetlił 'Cześć!'",
            fillTemplate: "_____('Cześć!')",
            correctFill: ["print"],
            explanation: "print() to podstawowa funkcja do wyświetlania tekstu w Pythonie.",
            xp: 15,
          },
          {
            id: "hw-q3",
            type: "code",
            prompt: "Napisz kod, który wyświetli swoje imię.",
            codeTemplate: "# Wpisz swoje imię tutaj\n",
            expectedOutput: "print(",
            explanation: "Używaj print('TwojeImię') — imię w cudzysłowie.",
            xp: 20,
          },
        ],
      },
      {
        id: "variables",
        title: "Zmienne",
        description: "Przechowywanie i używanie danych",
        icon: "📦",
        theory: `Zmienna to jak pudełko z etykietą — możesz przechowywać w niej wartości.

W Pythonie tworzysz zmienną przypisując do niej wartość:
**nazwa = wartość**

Nazwy zmiennych piszemy małymi literami, słowa rozdzielamy podkreślnikiem (np. **moja_zmienna**).`,
        codeExample: `imie = "Anna"
wiek = 25
wzrost = 1.68

print(imie)
print("Mam", wiek, "lat")
print(f"Wzrost: {wzrost} m")`,
        questions: [
          {
            id: "var-q1",
            type: "quiz",
            prompt: "Jak przypisać wartość 42 do zmiennej 'liczba'?",
            explanation: "W Pythonie przypisujemy wartość używając znaku =.",
            options: [
              { id: "a", text: "liczba == 42", correct: false },
              { id: "b", text: "42 = liczba", correct: false },
              { id: "c", text: "liczba = 42", correct: true },
              { id: "d", text: "var liczba = 42", correct: false },
            ],
            xp: 10,
          },
          {
            id: "var-q2",
            type: "fill",
            prompt: "Uzupełnij: przypisz tekst 'Python' do zmiennej 'jezyk'",
            fillTemplate: "jezyk ___ 'Python'",
            correctFill: ["="],
            explanation: "Operator = służy do przypisania wartości do zmiennej.",
            xp: 15,
          },
          {
            id: "var-q3",
            type: "quiz",
            prompt: "Co wyświetli ten kod?\n\nx = 10\ny = 3\nprint(x + y)",
            explanation: "Zmienne przechowują wartości. x=10, y=3, więc x+y=13.",
            options: [
              { id: "a", text: "x + y", correct: false },
              { id: "b", text: "13", correct: true },
              { id: "c", text: "103", correct: false },
              { id: "d", text: "Błąd", correct: false },
            ],
            xp: 10,
          },
        ],
      },
      {
        id: "data-types",
        title: "Typy danych",
        description: "int, float, str, bool",
        icon: "🔢",
        theory: `Python ma cztery podstawowe typy danych:

- **int** — liczby całkowite: 1, 42, -7
- **float** — liczby zmiennoprzecinkowe: 3.14, 2.0
- **str** — tekst (string): "witaj", 'Python'
- **bool** — wartość logiczna: True lub False

Funkcja **type()** pozwala sprawdzić typ zmiennej.`,
        codeExample: `wiek = 25          # int
wzrost = 1.75      # float
imie = "Piotr"     # str
czy_student = True  # bool

print(type(wiek))     # <class 'int'>
print(type(wzrost))   # <class 'float'>`,
        questions: [
          {
            id: "dt-q1",
            type: "quiz",
            prompt: "Jakiego typu jest wartość 3.14?",
            explanation: "Liczby z kropką dziesiętną w Pythonie to typ float.",
            options: [
              { id: "a", text: "int", correct: false },
              { id: "b", text: "float", correct: true },
              { id: "c", text: "str", correct: false },
              { id: "d", text: "bool", correct: false },
            ],
            xp: 10,
          },
          {
            id: "dt-q2",
            type: "quiz",
            prompt: "Który z poniższych jest typu str?",
            explanation: "Tekst ujęty w cudzysłów to typ string (str).",
            options: [
              { id: "a", text: "42", correct: false },
              { id: "b", text: "True", correct: false },
              { id: "c", text: "'42'", correct: true },
              { id: "d", text: "3.14", correct: false },
            ],
            xp: 10,
          },
          {
            id: "dt-q3",
            type: "fill",
            prompt: "Jaka funkcja sprawdza typ zmiennej?",
            fillTemplate: "print(_____(x))",
            correctFill: ["type"],
            explanation: "Funkcja type() zwraca typ danej wartości lub zmiennej.",
            xp: 15,
          },
        ],
      },
    ],
  },
  {
    id: "control-flow",
    title: "Sterowanie przepływem",
    description: "Warunki, pętle i logika programu",
    color: "#6366f1",
    accent: "#4f46e5",
    level: "beginner",
    icon: "🔀",
    lessons: [
      {
        id: "if-else",
        title: "Instrukcja if/else",
        description: "Podejmowanie decyzji w kodzie",
        icon: "🤔",
        theory: `Instrukcja **if** pozwala wykonywać kod warunkowo — tylko gdy warunek jest spełniony.

Składnia:
\`\`\`
if warunek:
    # kod gdy True
elif inny_warunek:
    # kod gdy drugi warunek True
else:
    # kod gdy żaden nie pasuje
\`\`\`

**Ważne:** W Pythonie wcięcia (spacje/tab) są obowiązkowe!`,
        codeExample: `wiek = 18

if wiek >= 18:
    print("Jesteś pełnoletni!")
elif wiek >= 13:
    print("Jesteś nastolatkiem")
else:
    print("Jesteś dzieckiem")`,
        questions: [
          {
            id: "if-q1",
            type: "quiz",
            prompt: "Co wyświetli ten kod?\n\nx = 10\nif x > 5:\n    print('duże')\nelse:\n    print('małe')",
            explanation: "x=10, więc 10 > 5 jest True → wyświetla 'duże'.",
            options: [
              { id: "a", text: "małe", correct: false },
              { id: "b", text: "duże", correct: true },
              { id: "c", text: "duże\nMałe", correct: false },
              { id: "d", text: "Błąd", correct: false },
            ],
            xp: 10,
          },
          {
            id: "if-q2",
            type: "order",
            prompt: "Ułóż linie kodu w prawidłowej kolejności:",
            orderLines: [
              "    print('Za zimno!')",
              "if temperatura < 10:",
              "temp = 5",
              "    print('W sam raz!')",
              "else:",
            ],
            correctOrder: [2, 1, 0, 4, 3],
            explanation: "Najpierw zmienna, potem if z wcięciem, else i jego treść.",
            xp: 20,
          },
          {
            id: "if-q3",
            type: "quiz",
            prompt: "Który operator sprawdza czy wartości są równe?",
            explanation: "== to operator porównania. = to przypisanie.",
            options: [
              { id: "a", text: "=", correct: false },
              { id: "b", text: "=>", correct: false },
              { id: "c", text: "==", correct: true },
              { id: "d", text: "!=", correct: false },
            ],
            xp: 10,
          },
        ],
      },
      {
        id: "loops",
        title: "Pętle",
        description: "for i while — powtarzanie kodu",
        icon: "🔁",
        theory: `Pętle pozwalają wielokrotnie wykonywać ten sam kod.

**Pętla for** — dla określonej liczby iteracji:
\`\`\`
for i in range(5):
    print(i)  # wyświetli 0,1,2,3,4
\`\`\`

**Pętla while** — dopóki warunek jest True:
\`\`\`
x = 0
while x < 3:
    print(x)
    x += 1
\`\`\``,
        codeExample: `# Pętla for
for i in range(1, 4):
    print(f"Krok {i}")

# Iteracja po liście
owoce = ["jabłko", "gruszka", "śliwka"]
for owoc in owoce:
    print(owoc)`,
        questions: [
          {
            id: "loop-q1",
            type: "quiz",
            prompt: "Ile razy wykona się ta pętla?\n\nfor i in range(3):\n    print(i)",
            explanation: "range(3) generuje wartości 0, 1, 2 — czyli 3 iteracje.",
            options: [
              { id: "a", text: "2", correct: false },
              { id: "b", text: "3", correct: true },
              { id: "c", text: "4", correct: false },
              { id: "d", text: "0", correct: false },
            ],
            xp: 10,
          },
          {
            id: "loop-q2",
            type: "fill",
            prompt: "Uzupełnij pętle by liczyła od 0 do 4:",
            fillTemplate: "for i in _____(5):\n    print(i)",
            correctFill: ["range"],
            explanation: "range(5) zwraca liczby 0, 1, 2, 3, 4.",
            xp: 15,
          },
          {
            id: "loop-q3",
            type: "quiz",
            prompt: "Co wyświetli?\n\ni = 0\nwhile i < 3:\n    print(i)\n    i += 1",
            explanation: "Pętla while działa dopóki warunek jest True. i rośnie z 0 do 2.",
            options: [
              { id: "a", text: "0\n1\n2\n3", correct: false },
              { id: "b", text: "1\n2\n3", correct: false },
              { id: "c", text: "0\n1\n2", correct: true },
              { id: "d", text: "Pętla nieskończona", correct: false },
            ],
            xp: 10,
          },
        ],
      },
    ],
  },
  {
    id: "functions",
    title: "Funkcje",
    description: "Tworzenie własnych bloków kodu wielokrotnego użytku",
    color: "#f59e0b",
    accent: "#d97706",
    level: "intermediate",
    icon: "⚙️",
    lessons: [
      {
        id: "def-functions",
        title: "Definiowanie funkcji",
        description: "def, parametry i zwracanie wartości",
        icon: "🔧",
        theory: `Funkcja to nazwany blok kodu, który możesz wywoływać wielokrotnie.

Składnia:
\`\`\`
def nazwa_funkcji(parametr1, parametr2):
    # kod funkcji
    return wynik
\`\`\`

Słowo kluczowe **return** zwraca wartość z funkcji.
Parametry to dane wejściowe funkcji.`,
        codeExample: `def przywitaj(imie):
    return f"Cześć, {imie}!"

def dodaj(a, b):
    return a + b

print(przywitaj("Anna"))   # Cześć, Anna!
print(dodaj(3, 5))         # 8`,
        questions: [
          {
            id: "fn-q1",
            type: "quiz",
            prompt: "Jakim słowem kluczowym definiujemy funkcję?",
            explanation: "def (skrót od define) służy do tworzenia funkcji w Pythonie.",
            options: [
              { id: "a", text: "function", correct: false },
              { id: "b", text: "fun", correct: false },
              { id: "c", text: "def", correct: true },
              { id: "d", text: "func", correct: false },
            ],
            xp: 10,
          },
          {
            id: "fn-q2",
            type: "fill",
            prompt: "Uzupełnij definicję funkcji:",
            fillTemplate: "_____ powitaj(imie):\n    print(f'Cześć {imie}')",
            correctFill: ["def"],
            explanation: "Słowo def rozpoczyna definicję funkcji.",
            xp: 15,
          },
          {
            id: "fn-q3",
            type: "quiz",
            prompt: "Co zwróci ta funkcja?\n\ndef kwadrat(x):\n    return x * x\n\nprint(kwadrat(4))",
            explanation: "4 * 4 = 16. Funkcja mnoży liczbę przez siebie.",
            options: [
              { id: "a", text: "8", correct: false },
              { id: "b", text: "4", correct: false },
              { id: "c", text: "16", correct: true },
              { id: "d", text: "x * x", correct: false },
            ],
            xp: 10,
          },
        ],
      },
      {
        id: "scope",
        title: "Zasięg zmiennych",
        description: "Zmienne lokalne i globalne",
        icon: "🌐",
        theory: `Zasięg (scope) określa gdzie zmienna jest dostępna.

**Zmienna lokalna** — istnieje tylko wewnątrz funkcji.
**Zmienna globalna** — dostępna w całym programie.

\`\`\`
x = 10  # globalna

def fun():
    y = 5  # lokalna
    print(x)  # OK - dostęp do globalnej
    print(y)  # OK - lokalna

print(x)  # OK
# print(y)  # Błąd! y jest lokalna
\`\`\``,
        codeExample: `liczba = 100  # globalna

def pokaz():
    wiadomosc = "Jestem lokalna"  # lokalna
    print(liczba)      # dostęp do globalnej
    print(wiadomosc)   # lokalna OK

pokaz()
print(liczba)  # OK`,
        questions: [
          {
            id: "sc-q1",
            type: "quiz",
            prompt: "Zmienna zdefiniowana wewnątrz funkcji to zmienna:",
            explanation: "Zmienne wewnątrz funkcji mają zasięg lokalny — nie są widoczne poza funkcją.",
            options: [
              { id: "a", text: "Globalna", correct: false },
              { id: "b", text: "Lokalna", correct: true },
              { id: "c", text: "Statyczna", correct: false },
              { id: "d", text: "Publiczna", correct: false },
            ],
            xp: 10,
          },
          {
            id: "sc-q2",
            type: "quiz",
            prompt: "Co się stanie?\n\ndef fun():\n    x = 5\n\nfun()\nprint(x)",
            explanation: "x jest zmienną lokalną funkcji fun(). Nie istnieje poza nią — wystąpi błąd.",
            options: [
              { id: "a", text: "Wyświetli 5", correct: false },
              { id: "b", text: "Wyświetli None", correct: false },
              { id: "c", text: "Błąd NameError", correct: true },
              { id: "d", text: "Wyświetli 0", correct: false },
            ],
            xp: 15,
          },
        ],
      },
    ],
  },
  {
    id: "data-structures",
    title: "Struktury danych",
    description: "Listy, słowniki, krotki i zbiory",
    color: "#ec4899",
    accent: "#db2777",
    level: "intermediate",
    icon: "📚",
    lessons: [
      {
        id: "lists",
        title: "Listy",
        description: "Kolekcje elementów w jednej zmiennej",
        icon: "📋",
        theory: `Lista to uporządkowana kolekcja elementów. Tworzona nawiasami kwadratowymi.

\`\`\`
owoce = ["jabłko", "gruszka", "banan"]
\`\`\`

**Indeksowanie** (od 0!):
- owoce[0] → "jabłko"
- owoce[-1] → "banan" (ostatni)

**Metody list:**
- .append(x) — dodaj element
- .remove(x) — usuń element
- len(lista) — długość`,
        codeExample: `liczby = [1, 2, 3, 4, 5]

print(liczby[0])    # 1
print(liczby[-1])   # 5
print(len(liczby))  # 5

liczby.append(6)
print(liczby)  # [1, 2, 3, 4, 5, 6]

for n in liczby:
    print(n * 2)`,
        questions: [
          {
            id: "lst-q1",
            type: "quiz",
            prompt: "Co zwróci lista[1] dla lista = [10, 20, 30]?",
            explanation: "Indeksowanie zaczyna się od 0. Indeks 1 to drugi element — 20.",
            options: [
              { id: "a", text: "10", correct: false },
              { id: "b", text: "20", correct: true },
              { id: "c", text: "30", correct: false },
              { id: "d", text: "Błąd", correct: false },
            ],
            xp: 10,
          },
          {
            id: "lst-q2",
            type: "fill",
            prompt: "Dodaj element 'python' do listy:",
            fillTemplate: "jezyki = ['java', 'c++']\njezyki._____(\"python\")",
            correctFill: ["append"],
            explanation: ".append() dodaje element na koniec listy.",
            xp: 15,
          },
          {
            id: "lst-q3",
            type: "quiz",
            prompt: "Co zwróci len(['a', 'b', 'c', 'd'])?",
            explanation: "len() zwraca liczbę elementów w liście. Lista ma 4 elementy.",
            options: [
              { id: "a", text: "3", correct: false },
              { id: "b", text: "4", correct: true },
              { id: "c", text: "5", correct: false },
              { id: "d", text: "0", correct: false },
            ],
            xp: 10,
          },
        ],
      },
      {
        id: "dicts",
        title: "Słowniki",
        description: "Pary klucz-wartość",
        icon: "📖",
        theory: `Słownik przechowuje dane w parach klucz-wartość.

\`\`\`
osoba = {
    "imie": "Anna",
    "wiek": 25
}
\`\`\`

**Dostęp:**
- osoba["imie"] → "Anna"
- osoba.get("wiek") → 25

**Modyfikacja:**
- osoba["wiek"] = 26
- osoba["miasto"] = "Warszawa" (nowy klucz)`,
        codeExample: `gracz = {
    "nick": "PyMaster",
    "poziom": 5,
    "xp": 1200
}

print(gracz["nick"])       # PyMaster
print(gracz.get("poziom")) # 5

gracz["xp"] += 100
gracz["klasa"] = "Mag"

for klucz, wartosc in gracz.items():
    print(f"{klucz}: {wartosc}")`,
        questions: [
          {
            id: "dct-q1",
            type: "quiz",
            prompt: "Jak uzyskać dostęp do wartości 'Anna' w:\nd = {'imie': 'Anna', 'wiek': 25}",
            explanation: "Do wartości w słowniku dostajemy się przez klucz w nawiasach kwadratowych.",
            options: [
              { id: "a", text: "d.Anna", correct: false },
              { id: "b", text: "d(0)", correct: false },
              { id: "c", text: "d['imie']", correct: true },
              { id: "d", text: "d.get(0)", correct: false },
            ],
            xp: 10,
          },
          {
            id: "dct-q2",
            type: "fill",
            prompt: "Utwórz słownik z kluczem 'kolor' i wartością 'niebieski':",
            fillTemplate: "d = {\"kolor\": _____}",
            correctFill: ['"niebieski"', "'niebieski'"],
            explanation: "Wartość tekstowa musi być ujęta w cudzysłów.",
            xp: 15,
          },
        ],
      },
    ],
  },
  {
    id: "oop",
    title: "Programowanie obiektowe",
    description: "Klasy, obiekty i dziedziczenie",
    color: "#8b5cf6",
    accent: "#7c3aed",
    level: "advanced",
    icon: "🏛️",
    lessons: [
      {
        id: "classes",
        title: "Klasy i obiekty",
        description: "Tworzenie własnych typów danych",
        icon: "🏗️",
        theory: `Klasa to szablon do tworzenia obiektów. Obiekt to instancja klasy.

\`\`\`
class Samochod:
    def __init__(self, marka, rok):
        self.marka = marka
        self.rok = rok
    
    def opis(self):
        return f"{self.marka} ({self.rok})"
\`\`\`

- **__init__** — konstruktor (wywołany przy tworzeniu obiektu)
- **self** — odniesienie do bieżącego obiektu
- **Metoda** — funkcja wewnątrz klasy`,
        codeExample: `class Gracz:
    def __init__(self, nick, poziom=1):
        self.nick = nick
        self.poziom = poziom
        self.xp = 0
    
    def zdobadz_xp(self, ilosc):
        self.xp += ilosc
        if self.xp >= 100:
            self.poziom += 1
            self.xp = 0
            print(f"LEVEL UP! Poziom {self.poziom}!")

g = Gracz("PyHero")
g.zdobadz_xp(50)
print(g.nick, g.xp)`,
        questions: [
          {
            id: "cls-q1",
            type: "quiz",
            prompt: "Jaka metoda jest wywoływana automatycznie przy tworzeniu obiektu?",
            explanation: "__init__ to konstruktor — inicjalizuje nowy obiekt.",
            options: [
              { id: "a", text: "__start__", correct: false },
              { id: "b", text: "__create__", correct: false },
              { id: "c", text: "__init__", correct: true },
              { id: "d", text: "__new__", correct: false },
            ],
            xp: 15,
          },
          {
            id: "cls-q2",
            type: "quiz",
            prompt: "Co oznacza parametr 'self' w metodzie klasy?",
            explanation: "self odnosi się do konkretnego obiektu (instancji) klasy.",
            options: [
              { id: "a", text: "Nazwę klasy", correct: false },
              { id: "b", text: "Referencję do bieżącego obiektu", correct: true },
              { id: "c", text: "Typ zmiennej", correct: false },
              { id: "d", text: "Słowo kluczowe opcjonalne", correct: false },
            ],
            xp: 15,
          },
          {
            id: "cls-q3",
            type: "fill",
            prompt: "Uzupełnij definicję klasy:",
            fillTemplate: "_____ Auto:\n    def __init__(self, marka):\n        self.marka = marka",
            correctFill: ["class"],
            explanation: "Klasy definiujemy słowem kluczowym class.",
            xp: 20,
          },
        ],
      },
      {
        id: "inheritance",
        title: "Dziedziczenie",
        description: "Rozszerzanie klas",
        icon: "🧬",
        theory: `Dziedziczenie pozwala klasie (potomnej) przejąć cechy innej klasy (nadrzędnej).

\`\`\`
class Zwierze:
    def __init__(self, imie):
        self.imie = imie
    
    def dzwiek(self):
        return "..."

class Pies(Zwierze):  # dziedziczy po Zwierze
    def dzwiek(self):
        return "Hau!"
\`\`\`

**super()** — wywołuje metodę klasy nadrzędnej.`,
        codeExample: `class Postac:
    def __init__(self, imie, hp):
        self.imie = imie
        self.hp = hp
    
    def status(self):
        return f"{self.imie}: {self.hp} HP"

class Wojownik(Postac):
    def __init__(self, imie, hp, sila):
        super().__init__(imie, hp)
        self.sila = sila
    
    def atak(self):
        return f"{self.imie} atakuje za {self.sila}!"

w = Wojownik("Aragorn", 100, 25)
print(w.status())
print(w.atak())`,
        questions: [
          {
            id: "inh-q1",
            type: "quiz",
            prompt: "Jak wskazać, że klasa Pies dziedziczy po klasie Zwierze?",
            explanation: "Klasę nadrzędną podajemy w nawiasach po nazwie klasy.",
            options: [
              { id: "a", text: "class Pies extends Zwierze:", correct: false },
              { id: "b", text: "class Pies(Zwierze):", correct: true },
              { id: "c", text: "class Pies inherits Zwierze:", correct: false },
              { id: "d", text: "Pies = Zwierze.inherit()", correct: false },
            ],
            xp: 15,
          },
          {
            id: "inh-q2",
            type: "quiz",
            prompt: "Do czego służy super().__init__()?",
            explanation: "super().__init__() wywołuje konstruktor klasy nadrzędnej — inicjalizuje jej atrybuty.",
            options: [
              { id: "a", text: "Tworzy nową klasę", correct: false },
              { id: "b", text: "Wywołuje konstruktor klasy nadrzędnej", correct: true },
              { id: "c", text: "Usuwa obiekt", correct: false },
              { id: "d", text: "Sprawdza typ obiektu", correct: false },
            ],
            xp: 15,
          },
        ],
      },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // CHAPTER: Pętle i iteracje (new lessons)
  // ═══════════════════════════════════════════════════════════
  {
    id: "loops-advanced",
    title: "Pętle i iteracje",
    description: "For, while i sterowanie przepływem",
    color: "#06b6d4",
    accent: "#0891b2",
    level: "beginner" as const,
    icon: "🔄",
    lessons: [
      {
        id: "for-loops",
        title: "Pętla for",
        description: "Iteruj po listach i zakresach",
        icon: "🔁",
        theory: `Pętla **for** pozwala wykonać kod wielokrotnie — dla każdego elementu listy lub zakresu.

Funkcja **range(n)** tworzy zakres liczb od 0 do n-1.

**for i in range(3):** wykona ciało pętli 3 razy (i = 0, 1, 2).`,
        codeExample: `for i in range(3):
    print(i)  # wypisze: 0, 1, 2

owoce = ["jabłko", "banan", "wiśnia"]
for owoc in owoce:
    print(owoc)`,
        questions: [
          {
            id: "for-q1",
            type: "quiz" as const,
            prompt: "Co wypisze ten kod?\n\nfor i in range(3):\n    print(i)",
            explanation: "range(3) tworzy zakres 0, 1, 2. Pętla wypisuje każdą wartość.",
            options: [
              { id: "a", text: "1, 2, 3", correct: false },
              { id: "b", text: "0, 1, 2", correct: true },
              { id: "c", text: "0, 1, 2, 3", correct: false },
              { id: "d", text: "1, 2", correct: false },
            ],
            xp: 10,
          },
          {
            id: "for-q2",
            type: "fill" as const,
            prompt: "Uzupełnij pętlę, która iteruje po liście:",
            fillTemplate: "_____ owoc in owoce:",
            correctFill: ["for"],
            explanation: "Słowo kluczowe 'for' rozpoczyna pętlę iterującą po elementach kolekcji.",
            xp: 10,
          },
          {
            id: "for-q3",
            type: "quiz" as const,
            prompt: "Ile razy wykona się pętla?\n\nfor i in range(5):\n    print('PyQuest')",
            explanation: "range(5) tworzy 5 wartości: 0, 1, 2, 3, 4. Pętla wykona się 5 razy.",
            options: [
              { id: "a", text: "4 razy", correct: false },
              { id: "b", text: "6 razy", correct: false },
              { id: "c", text: "5 razy", correct: true },
              { id: "d", text: "0 razy", correct: false },
            ],
            xp: 10,
          },
          {
            id: "for-q4",
            type: "order" as const,
            prompt: "Ułóż kod, który wypisuje liczby 1, 2, 3:",
            orderLines: [
              "for i in range(1, 4):",
              "    print(i)",
            ],
            correctOrder: [0, 1],
            explanation: "range(1, 4) tworzy zakres od 1 do 3 (4 jest wykluczone). Wcięcie oznacza ciało pętli.",
            xp: 15,
          },
        ],
      },
      {
        id: "while-loops",
        title: "Pętla while",
        description: "Powtarzaj dopóki warunek jest spełniony",
        icon: "⏳",
        theory: `Pętla **while** wykonuje kod tak długo, jak warunek jest prawdziwy.

Warunek jest sprawdzany **przed** każdym wykonaniem ciała pętli.

UWAGA: Pętla while bez zmiany warunku wewnątrz tworzy **pętlę nieskończoną**!`,
        codeExample: `licznik = 0
while licznik < 3:
    print(licznik)
    licznik += 1
# Wypisze: 0, 1, 2`,
        questions: [
          {
            id: "wh-q1",
            type: "quiz" as const,
            prompt: "Co wypisze ten kod?\n\nx = 5\nwhile x > 3:\n    print(x)\n    x -= 1",
            explanation: "x zaczyna od 5. Pętla działa dla x=5 (wypisuje 5), x=4 (wypisuje 4), x=3 jest fałszem — koniec.",
            options: [
              { id: "a", text: "5, 4, 3", correct: false },
              { id: "b", text: "5, 4", correct: true },
              { id: "c", text: "5", correct: false },
              { id: "d", text: "4, 3", correct: false },
            ],
            xp: 10,
          },
          {
            id: "wh-q2",
            type: "fill" as const,
            prompt: "Uzupełnij pętlę while:",
            fillTemplate: "while x _____ 10:",
            correctFill: ["<", "< "],
            explanation: "Operator < (mniejszy niż) sprawdza warunek. Pętla działa dopóki x jest mniejsze od 10.",
            xp: 10,
          },
          {
            id: "wh-q3",
            type: "quiz" as const,
            prompt: "Co się stanie, jeśli warunek while nigdy nie stanie się fałszem?",
            explanation: "Pętla nieskończona zawiesza program. Zawsze zadbaj o to, żeby warunek mógł zostać fałszem — np. przez inkrementację zmiennej.",
            options: [
              { id: "a", text: "Program się zatrzyma po 100 iteracjach", correct: false },
              { id: "b", text: "Pętla nigdy się nie skończy (nieskończona pętla)", correct: true },
              { id: "c", text: "Python automatycznie przerwie pętlę", correct: false },
              { id: "d", text: "Wystąpi błąd składni", correct: false },
            ],
            xp: 10,
          },
          {
            id: "wh-q4",
            type: "order" as const,
            prompt: "Ułóż poprawną pętlę while:",
            orderLines: [
              "n = 1",
              "while n <= 3:",
              "    print(n)",
              "    n += 1",
            ],
            correctOrder: [0, 1, 2, 3],
            explanation: "Najpierw inicjalizacja zmiennej, potem warunek while, ciało pętli, a na końcu inkrementacja — żeby pętla kiedyś się skończyła.",
            xp: 15,
          },
        ],
      },
      {
        id: "functions-basic",
        title: "Funkcje — podstawy",
        description: "Definiuj i wywołuj własne funkcje",
        icon: "⚙️",
        theory: `**Funkcja** to nazwany blok kodu, który możesz uruchamiać wielokrotnie.

Definicja: **def nazwa_funkcji():** — po dwukropku wcięty blok kodu.

Wywołanie: **nazwa_funkcji()** — nawiasy są obowiązkowe!`,
        codeExample: `def przywitaj():
    print("Witaj, Pythonisto!")

def dodaj(a, b):
    return a + b

przywitaj()      # Wywołanie
wynik = dodaj(3, 4)  # wynik = 7`,
        questions: [
          {
            id: "fn-q1",
            type: "quiz" as const,
            prompt: "Jakim słowem kluczowym definiujemy funkcję w Pythonie?",
            explanation: "'def' (od 'define') to słowo kluczowe do definicji funkcji. Zawsze poprzedza nazwę funkcji.",
            options: [
              { id: "a", text: "function", correct: false },
              { id: "b", text: "func", correct: false },
              { id: "c", text: "def", correct: true },
              { id: "d", text: "define", correct: false },
            ],
            xp: 10,
          },
          {
            id: "fn-q2",
            type: "fill" as const,
            prompt: "Uzupełnij definicję funkcji:",
            fillTemplate: "_____ powitanie():",
            correctFill: ["def"],
            explanation: "'def' rozpoczyna definicję funkcji. Następuje po nim nazwa, nawiasy i dwukropek.",
            xp: 10,
          },
          {
            id: "fn-q3",
            type: "quiz" as const,
            prompt: "Co zwróci ta funkcja?\n\ndef podwoj(x):\n    return x * 2\n\nprint(podwoj(5))",
            explanation: "Funkcja mnoży x przez 2. Dla x=5: 5*2=10. Instrukcja return zwraca wartość.",
            options: [
              { id: "a", text: "5", correct: false },
              { id: "b", text: "25", correct: false },
              { id: "c", text: "10", correct: true },
              { id: "d", text: "Błąd", correct: false },
            ],
            xp: 10,
          },
          {
            id: "fn-q4",
            type: "order" as const,
            prompt: "Ułóż poprawną definicję i wywołanie funkcji:",
            orderLines: [
              "def suma(a, b):",
              "    return a + b",
              "wynik = suma(3, 7)",
              "print(wynik)",
            ],
            correctOrder: [0, 1, 2, 3],
            explanation: "Kolejność: definicja funkcji (def + ciało), wywołanie z przypisaniem, wypisanie wyniku.",
            xp: 15,
          },
        ],
      },
      {
        id: "strings-methods",
        title: "Metody łańcuchów",
        description: "Manipuluj tekstem w Pythonie",
        icon: "📝",
        theory: `Łańcuchy tekstowe (strings) mają wbudowane **metody** — funkcje przypisane do obiektu.

**upper()** — zamienia na wielkie litery
**lower()** — zamienia na małe litery
**len()** — zwraca długość łańcucha
**strip()** — usuwa białe znaki z początku i końca`,
        codeExample: `tekst = "  Python  "
print(tekst.upper())   # "  PYTHON  "
print(tekst.strip())   # "Python"
print(len(tekst))      # 10
print(tekst.lower())   # "  python  "`,
        questions: [
          {
            id: "str-q1",
            type: "quiz" as const,
            prompt: "Co wypisze ten kod?\n\ntekst = \"python\"\nprint(tekst.upper())",
            explanation: "Metoda upper() zamienia wszystkie litery na wielkie. 'python' staje się 'PYTHON'.",
            options: [
              { id: "a", text: "python", correct: false },
              { id: "b", text: "Python", correct: false },
              { id: "c", text: "PYTHON", correct: true },
              { id: "d", text: "PYTHON()", correct: false },
            ],
            xp: 10,
          },
          {
            id: "str-q2",
            type: "fill" as const,
            prompt: "Uzupełnij kod, który zwróci długość tekstu:",
            fillTemplate: "wynik = _____(\"dungeon\")",
            correctFill: ["len"],
            explanation: "Funkcja len() zwraca długość łańcucha. len('dungeon') = 7.",
            xp: 10,
          },
          {
            id: "str-q3",
            type: "quiz" as const,
            prompt: "Jaka będzie wartość?\n\nnapis = \"  hero  \"\nprint(len(napis.strip()))",
            explanation: "strip() usuwa białe znaki z brzegów: '  hero  ' staje się 'hero' (4 znaki). len('hero') = 4.",
            options: [
              { id: "a", text: "8", correct: false },
              { id: "b", text: "6", correct: false },
              { id: "c", text: "4", correct: true },
              { id: "d", text: "7", correct: false },
            ],
            xp: 10,
          },
          {
            id: "str-q4",
            type: "fill" as const,
            prompt: "Wywołaj metodę, która zamieni na małe litery:",
            fillTemplate: "wynik = \"PYTHON\"._____()",
            correctFill: ["lower"],
            explanation: "Metoda lower() zamienia wszystkie litery na małe. 'PYTHON'.lower() = 'python'.",
            xp: 15,
          },
        ],
      },
    ],
  },
];

export function getLessonById(lessonId: string): { lesson: Lesson; chapter: Chapter } | null {
  for (const chapter of curriculum) {
    for (const lesson of chapter.lessons) {
      if (lesson.id === lessonId) {
        return { lesson, chapter };
      }
    }
  }
  return null;
}

export function getTotalLessons(): number {
  return curriculum.reduce((sum, ch) => sum + ch.lessons.length, 0);
}
