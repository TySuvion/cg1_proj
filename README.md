# Space Pot

### A Floating Teapot in Space - CG1 Projektabgaben von Tyler Rose und Konrad Kappmeyer

Das Programm führt die main()-Funktion aus src/app.js beim onload aus.
In der Datei src/matrix.js befinden sich Matrizen Berechnungen
In src/functions.js und src/objectLoader sind Hilfsfunktionen, die vom main Programm genutzt werden.
Und in vars.js werden Globale Variablen gespeichert, auf die, das main-Programm sowie die Hilfsfunktionen Zugreifen.
In src/shaders/ befinden sich alle Shaderprogramme.
In textures/ ist die Skybox Textur gespeichert
In obc/ ist die teapot.obj gespeichert

#### Steureung

- Die Kamera rotiert von alleine um den Cube
- Der Cube kann samt Inhalt aber auch durch Keyboard Input rotiert werden
  - Rotieren um die X-Achse mit ArrowUp und ArrowDown
  - Rotieren um die Y-Achse mit ArrowLeft und ArrowRight
  - Zum Anpassen der Rotationsgeschwindigkeit, kann die Variable rotationSpeed in der Datei src/vars.js angepasst werden.
  - Leider reseted sich die Position des Cubes wenn man die rotations Achse wechselt.
