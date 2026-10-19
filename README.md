# Schätz das Geld!

Ein Schätzspiel für Kinder rund ums Thema Geld, gebaut für den **Tag der offenen Tür des Finance Clubs an der HTL Leonding**.
Alle Zahlen beziehen sich auf **Österreich**.
Die Kinder schätzen mit einem großen Schieberegler Preise, Gehälter und Ausgaben, zum Beispiel was eine Kugel Eis oder
eine Leberkässemmel kostet oder wie viel Geld ein Erwachsener im Monat aufs Konto bekommt. Danach sehen sie die richtige Antwort, bekommen
0 bis 3 Sterne und lernen einen kurzen Fakt dazu.

Das Spiel ist für Tablets gemacht: komplett per Touch bedienbar, eine Bildschirmseite, ohne Scrollen.

## Features

- 8 Fragen pro Runde, zufällig aus einem Pool von 15 gezogen
- Schieberegler mit großem Münz-Griff, dazu −/+ Knöpfe zum Feinjustieren
- Sparglas, das sich beim Schieben füllt
- Sterne-Wertung, Erklärtext zu jeder Antwort, Konfetti und Töne (abschaltbar)
- **Messe-Modus:** Nach 90 Sekunden ohne Eingabe (bzw. 25 Sekunden auf dem Endbildschirm) springt das Spiel zurück zum Start
- Bildschirm bleibt an (Wake Lock, wo der Browser das unterstützt)
- Offline-fähig als Web-App (Service Worker), sobald es einmal über http(s) geladen wurde
- Kein Build-Schritt, keine Abhängigkeiten: nur HTML, CSS und JavaScript

## Starten

**Einfach:** `index.html` im Browser öffnen. Das Spiel läuft auch so, nur der Offline-Modus ist dann aus.

**Lokaler Server** (für Offline-Modus und zum Testen auf dem Tablet im selben WLAN), z. B.:

```bash
php -S 0.0.0.0:8080
```

```bash
python -m http.server 8080
```

```bash
npx serve .
```

Dann `http://localhost:8080` öffnen (bzw. `http://<IP-des-Rechners>:8080` auf dem Tablet).

## Am Tag der offenen Tür

1. Spiel einmal mit Internet öffnen, damit Dateien und Schriften im Cache landen.
2. Auf dem Tablet **„Zum Startbildschirm hinzufügen“** wählen. Dann startet es im Vollbild wie eine App.
3. Optional die App-Fixierung des Tablets nutzen (iPad: *Geführter Zugriff*, Android: *App anheften*),
   damit die Kinder nicht aus dem Spiel kommen.
4. Einmal komplett durchspielen.

## Online stellen (GitHub Pages)

1. Repo auf GitHub pushen.
2. *Settings → Pages → Source:* Branch `main`, Ordner `/ (root)`.
3. Nach kurzer Zeit läuft das Spiel unter `https://<user>.github.io/<repo>/`.

Alle Pfade sind relativ, das Spiel funktioniert also auch in einem Unterordner.

## Fragen anpassen

Alle Fragen stehen in [`js/questions.js`](js/questions.js):

```js
{ emoji: "🍦", q: "Wie viel kostet eine Kugel Eis in der Eisdiele?",
  min: 0, max: 5, step: 0.1, unit: "€", answer: 2,
  fact: "Vor 20 Jahren hat eine Kugel oft nur 70 Cent gekostet. ..." },
```

| Feld | Bedeutung |
| --- | --- |
| `emoji` | Bild zur Frage |
| `q` | Fragetext |
| `min`, `max`, `step` | Bereich und Schrittweite des Schiebereglers |
| `unit` | `"€"`, `"g"`, `"Std."` oder `"year"` (Jahreszahl ohne Tausenderpunkt) |
| `answer` | richtige Antwort |
| `fact` | Erklärung, die nach dem Schätzen angezeigt wird |

**Tipps:**
- Die richtige Antwort sollte nicht genau in der Mitte oder am Rand des Bereichs liegen.
- Die Sterne hängen davon ab, wie weit die Schätzung daneben liegt, gemessen an der Breite des Reglers:
  bis 3 % = 3 Sterne, bis 8 % = 2 Sterne, bis 18 % = 1 Stern. Ein sehr breiter Bereich macht die Frage also leichter.
- Rundenanzahl und Leerlaufzeit stehen oben in [`js/game.js`](js/game.js) (`ROUNDS`, `IDLE_MS`).
- Nach Änderungen die Versionsnummer `CACHE` in [`sw.js`](sw.js) erhöhen, sonst zeigen Tablets mit Offline-Cache noch die alte Version.

> Die Zahlen sind gerundete Richtwerte für Österreich (Stand ca. 2024/25) und sollten vor dem Einsatz gegengeprüft werden.

## Projektstruktur

```
├── index.html            Markup und Bildschirme (Start, Frage, Ergebnis)
├── css/style.css         Gestaltung
├── js/questions.js       Fragen-Pool
├── js/game.js            Spiellogik, Töne, Konfetti, Leerlauf-Reset
├── sw.js                 Service Worker für Offline-Betrieb
├── manifest.webmanifest  Web-App-Manifest (Vollbild, Icon)
└── assets/icon.svg       App-Icon
```
