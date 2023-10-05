window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  var scrollToTopButton = document.getElementById("scrollToTopButton");

  // Mostra il bottone quando l'utente scorre verso il basso di 300 pixel dalla cima della pagina
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    scrollToTopButton.style.display = "block";
  } else {
    scrollToTopButton.style.display = "none";
  }
}

function scrollToTop() {
  // Scrolla verso l'inizio della pagina con un effetto fluido
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Aggiungi un evento click al bottone per tornare all'inizio
var scrollToTopButton = document.getElementById("scrollToTopButton");
scrollToTopButton.addEventListener("click", scrollToTop);

