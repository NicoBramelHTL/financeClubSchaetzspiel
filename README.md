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
  min: 0, max: 5, step: 0.1, unit: "€", answer: 2.2,
  fact: "In Linz kostet eine Kugel im Schnitt sogar 2,30 €. ..." },
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

## Quellen

Die Zahlen sind gerundete Werte für Österreich, geprüft im November 2026. Preise schwanken je nach Ort und Geschäft.

| Frage | Antwort | Quelle |
| --- | --- | --- |
| Kugel Eis | 2,20 € (Linz 2,30 €, 2020: 1,65 €) | Umfrage coupons.de 2025, Orderbird-Eisreport 2023 |
| Leberkässemmel | 3,50 € (Spanne 2,50–4,65 €) | [Salzburg24-Test](https://www.salzburg24.at/news/salzburg/leberkaessemmerl-im-test-wo-gibts-das-beste-in-salzburg-art-329104), Speisekarten |
| Semmel im Supermarkt | 0,35 € (Diskonter 15 Cent, Bäcker bis 89 Cent) | [VKI-Semmeltest via news.at](https://www.news.at/news/semmel-preis-leistung) |
| Kinoticket | 11 € | **Schätzwert**, keine österreichische Statistik gefunden (Deutschland 2025: 10,05 € laut FFA); 20 € pro Besuch inkl. Verpflegung laut Marketagent/Statista |
| Liter Vollmilch | 1,30 € (günstigste 1,05–1,40 €) | [AK Wien Preismonitor](https://wien.arbeiterkammer.at/beratung/konsumentenschutz/einkaufundrecht/Preisemonitor_202603.pdf), [VKI-Preisvergleich](https://vki.at/system/files/2024-12/2024-12-19_PA_Preisvergleich_DE.pdf) |
| Taschengeld 10 Jahre | 12 € pro Monat (Empfehlung 8–14 €) | [oesterreich.gv.at](https://www.oesterreich.gv.at/de/themen/steuern_und_finanzen/jugendrechte-finanzen/Seite.1740306) |
| 1-Euro-Münze | 7,5 g | Europäische Zentralbank |
| Euro-Bargeld | 1. Jänner 2002 | Oesterreichische Nationalbank |
| Wochenarbeitszeit | 40 Std. | Arbeitszeitgesetz, [Statistik Austria](https://www.statistik.at/fileadmin/announcement/2025/12/20251218WoechentlicheNormalarbeitszeit2024.pdf) |
| Netto-Monatsgehalt | 2.700 € | [Statistik Austria](https://www.statistik.at/statistiken/bevoelkerung-und-soziales/einkommen-und-soziale-lage/jaehrliche-personeneinkommen): Median Vollzeit 2024 = 55.678 € brutto/Jahr ≈ 3.980 € × 14; netto selbst berechnet |
| HTL-Einstiegsgehalt | 3.000 € brutto (2.900–3.150 €) | [trend.at](https://www.trend.at/karriere/aktuelle-gehaelter-junger-absolventen), Stellenanzeigen |
| Haushaltsausgaben/Jahr | 50.000 € (4.170 €/Monat) | [Statistik Austria, Konsumerhebung 2024/25](https://www.statistik.at/fileadmin/announcement/2026/03/20260304Konsumerhebung202425.pdf) |
| Gebrauchtwagen | 28.000 € | [AutoScout24-Preisindex Juni 2026](https://www.autoscout24.at/unternehmen/agpi/); 443 €/Monat Neuwagen-Finanzierung laut [Aramis/OpinionWay](https://www.leadersnet.at/news/101506,fuer-viele-oesterreicher-wird-das-auto-immer-mehr-zum-luxus.html) |
| Weihnachtsgeschenke | 390 € | [Handelsverband 2025](https://www.leadersnet.at/news/95379,oesterreicher-geben-heuer-389-euro-fuer-weihnachtsgeschenke-aus.html) |

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
