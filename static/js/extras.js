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

$(function () {
  $('#datepicker-autoClose').datepicker({
    todayHighlight: true,
    autoclose: true
  });

  var handleFormMaskedInput = function () {
    "use strict";
    $("#masked-input-date").mask("99/99/9999");
    $("#masked-input-phone").mask("(999) 999-9999");
    $("#masked-input-tid").mask("99-9999999");
    $("#masked-input-ssn").mask("999-99-9999");
    $("#masked-input-pno").mask("aaa-9999-a");
    $("#masked-input-pkey").mask("a*-999-a999");
  };

  var handleJqueryAutocomplete = function () {
    var availableTags = [
      'ActionScript',
      'AppleScript',
      'Asp',
      'BASIC',
    ];
    $('#jquery-autocomplete').autocomplete({
      source: availableTags
    });
  };

  $('.selectpicker').selectpicker('render');

  $(".default-select2").select2();
  $(".multiple-select2").select2({placeholder: "Select a state"});

  //buscar en tabla con jQuery
  $(document).ready(function () {
    $("#myInput").on("keyup", function () {
      var value = $(this).val().toLowerCase();
      $("#myTable tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });
})


$("#scroll-vertical-datatable").DataTable({
  scrollY: "350px",
  scrollCollapse: !0,
  paging: !1,
  language: {paginate: {previous: "<i class='mdi mdi-chevron-left'>", next: "<i class='mdi mdi-chevron-right'>"}},
  drawCallback: function () {
    $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
  }
})


// Add Row
// -----------------------------------------------------------------
var t = $('#demo-dt-addrow').DataTable({
  "responsive": true,
  "language": {
    "paginate": {
      "previous": '<i class="demo-psi-arrow-left"></i>',
      "next": '<i class="demo-psi-arrow-right"></i>'
    }
  },
  "dom": '<"newtoolbar">frtip'
});
$('#demo-custom-toolbar2').appendTo($("div.newtoolbar"));

var randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
$('#demo-dt-addrow-btn').on('click', function () {
  t.row.add([
    'Adam Doe',
    'New Row',
    'New Row',
    randomInt(1, 100),
    '2015/10/15',
    '$' + randomInt(1, 100) + ',000'
  ]).draw();
});