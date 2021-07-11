swal({
  text: 'Search for a movie. e.g. "La La Land".',
  content: "input",
  button: {
    text: "Search!",
    closeModal: false,
  },
})
  .then(name => {
    if (!name) throw null;

    return fetch(`https://itunes.apple.com/search?term=${name}&entity=movie`);
  })
  .then(results => {
    return results.json();
  })
  .then(json => {
    const movie = json.results[0];

    if (!movie) {
      return swal("No movie was found!");
    }

    const name = movie.trackName;
    const imageURL = movie.artworkUrl100;

    swal({
      title: "Top result:",
      text: name,
      icon: imageURL,
    });
  })
  .catch(err => {
    if (err) {
      swal("Oh noes!", "The AJAX request failed!", "error");
    } else {
      swal.stopLoading();
      swal.close();
    }
  });


const {value: formValues} = await Swal.fire({
  title: 'Multiple inputs',
  html:
    '<input id="swal-input1" class="swal2-input">' +
    '<input id="swal-input2" class="swal2-input">',
  focusConfirm: false,
  preConfirm: () => {
    return [
      document.getElementById('swal-input1').value,
      document.getElementById('swal-input2').value
    ]
  }
})

if (formValues) {
  Swal.fire(JSON.stringify(formValues))
}

$(document).ready(function () {
  $("#formulario").bind("submit", function () {
    // Capturamnos el boton de envío
    var btnEnviar = $("#btnEnviar");
    $.ajax({
      type: $(this).attr("method"),
      url: $(this).attr("action"),
      data: $(this).serialize(),
      beforeSend: function () {
        /*
        * Esta función se ejecuta durante el envió de la petición al
        * servidor.
        * */
        // btnEnviar.text("Enviando"); Para button
        btnEnviar.val("Enviando"); // Para input de tipo button
        btnEnviar.attr("disabled", "disabled");
      },
      complete: function (data) {
        /*
        * Se ejecuta al termino de la petición
        * */
        btnEnviar.val("Enviar formulario");
        btnEnviar.removeAttr("disabled");
      },
      success: function (data) {
        /*
        * Se ejecuta cuando termina la petición y esta ha sido
        * correcta
        * */
        $(".respuesta").html(data);
      },
      error: function (data) {
        /*
        * Se ejecuta si la peticón ha sido erronea
        * */
        alert("Problemas al tratar de enviar el formulario");
      }
    });
    // Nos permite cancelar el envio del formulario
    return false;
  });
});
