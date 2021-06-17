# Dokumentation

## Was soll meine Applikation am Ende (17. Juni) können?
Aus derzeitigem Standpunkt hätte ich gerne:
* PreviewView mit Preview Images
* User-Login mit Sessions (Arbeiten mit Cookies) (Das wird eine Challenge, deshalb kann ich nicht garantieren, dass ich das schaffe)
* Upload von Photos (ggf. mit UserLogin, sodass man nachsehen kann, wer das Bild, dass man gerade ansieht hochgeladen hat)
* ImageViewer mit Weiter/Zurück Knopf, mit dem man sich durch die Bilder navigieren kann.
* Like/Dislike System für jedes Bild

## Was habe ich bis heute (20. Mai) erledigt?
* PreviewView mit hardgecodeten Server-Responses

## Was möchte ich bis zum nächsten Mal erledigen?
1. Nach Klick auf ein PreviewImage soll man das Bild im ImageViewer mit Like/Dislike-System anzeigen können
2. Umstrukturierung auf FileSystem von der Oracle-Datenbank
3. Falls Punkt 2 auch erledigt, Beginn des Like/Dislike-Systems
4. Falls Punkt 3 auch erledigt, Ersetzung der Dummy-Responses des Servers auf "richtige" Daten (die aus dem File stammen)
5. Falls Punkt 4 auch erledigt, Speicherung der Daten (gesammelt durch das Like-System) am Server im File 


# Was funktioniert jetzt schlussendlich?
1. Image Upload (/upload.html)
2. Image Delete (in der Slideshow, aber nur für den User, der das Bild hochgeladen hat)
3. User Login (/login.html)
    - User, die fuktionieren:
    - "user": "password"
    - "user1": "password"
    - "david": "password"
    - Achtung! Es gibt keine Möglichkeit über das Interface user anzulegen!
4. Preview Images (Route: /)
5. protected directory (ein Verzeichnis, das wie wwwPublic funktioniert, allerdings dürfen nur eingeloggte user darauf zugreifen)
6. Like/Dislike System (Jeder User kann ein Like bzw. ein Dislike pro Bild vergeben)