$(document).ready(() => {
    const images = [
      "./images/volpe2.jpg",
      "./images/bruco2.jpg",
      "./images/topolino2.jpeg",
      // Aggiungi qui altre immagini nel formato "path/to/imageX.jpg"
    ];

    const randomImageElement = $("#randomImage");
    const randomButton1 = $("#randomButton1");
    const randomButton2 = $("#randomButton2");

    randomButton1.on("click", function(event) {
        event.preventDefault(); // Impedisce l'invio del form
        randomButton1.prop("disabled", true); // Disabilita il pulsante temporaneamente
    
        const randomIndex = Math.floor(Math.random() * images.length);
        const randomImagePath = images[randomIndex];
    
        // Nasconde l'immagine e cambia l'immagine solo quando è completamente nascosta
        randomImageElement.fadeOut(function() {
          randomImageElement.attr("src", randomImagePath);
          randomImageElement.fadeIn();
          randomButton1.prop("disabled", false); // Riabilita il pulsante dopo il caricamento dell'immagine
        });
      });
    
      randomButton2.on("click", function(event) {
        event.preventDefault(); // Impedisce l'invio del form
        randomButton2.prop("disabled", true); // Disabilita il pulsante temporaneamente
    
        const randomIndex = Math.floor(Math.random() * images.length);
        const randomImagePath = images[randomIndex];
    
        // Nasconde l'immagine e cambia l'immagine solo quando è completamente nascosta
        randomImageElement.fadeOut(function() {
          randomImageElement.attr("src", randomImagePath);
          randomImageElement.fadeIn();
          randomButton2.prop("disabled", false); // Riabilita il pulsante dopo il caricamento dell'immagine
        });
      });

    });