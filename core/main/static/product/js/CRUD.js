$(() => {
  //Set active class to Product path
  if (window.location.pathname.includes('product'))
    changeSidebar('.my-stored', '.my-stored-prod')

  listar()
  formStyles()

  //Event btn Add
  $('.btnAdd').on('click', function () {
    document.querySelector('#image_span').innerHTML = 'Nothing selected yet'
    document.querySelector('button[data-id="id_cat"] div div div').innerHTML = '---------'
    document.querySelector('#id_cat').attributes[6].ownerElement.value = ''
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
    $('#myModalForm').trigger('reset')
    $('#myModal').modal('show')
  })

  $('.selectpicker').selectpicker('render')

  $("input[name='stock']").TouchSpin({
    min: 0,
    max: 999999999999,
    step: 1,
    boostat: 5,
    maxboostedstep: 10,
    buttondown_class: 'btn bg-gradient-indigo circular-left',
    buttonup_class: 'btn bg-gradient-indigo circular-right',
    postfix: '#',
  }).on('change', function () {
    if (this.value === '0') {
      document.querySelector('.bootstrap-touchspin-down').classList.remove('bg-gradient-indigo')
      document.querySelector('.bootstrap-touchspin-down').classList.add('bg-gradient-danger')
      this.classList.add('w3-text-red')
    }
    if (this.value !== '0') {
      document.querySelector('.bootstrap-touchspin-down').classList.remove('bg-gradient-danger')
      document.querySelector('.bootstrap-touchspin-down').classList.add('bg-gradient-indigo')
      this.classList.remove('w3-text-red')
    }
  })

  $("input[name='s_price']").TouchSpin({
    min: 0,
    max: 999999999999,
    boostat: 5,
    maxboostedstep: 10,
    prefix: `$`,
    step: 0.01,
    decimals: 2,
    buttondown_class: 'btn bg-gradient-indigo circular-left',
    buttonup_class: 'btn bg-gradient-indigo circular-right'
  }).on('change', function () {
    if (parseFloat(this.value) === 0) {
      document.querySelectorAll('.bootstrap-touchspin-down')[1].classList.remove('bg-gradient-indigo')
      document.querySelectorAll('.bootstrap-touchspin-down')[1].classList.add('bg-gradient-danger')
      this.classList.add('w3-text-red')
    }
    if (parseFloat(this.value) !== 0) {
      document.querySelectorAll('.bootstrap-touchspin-down')[1].classList.remove('bg-gradient-danger')
      document.querySelectorAll('.bootstrap-touchspin-down')[1].classList.add('bg-gradient-primary')
      this.classList.remove('w3-text-red')
    }
  })

  $('#myModalDetail div.modal-footer button:last').on('click', function () {
    $('#myModalDetail').modal('hide')
  })

  $('a[rel="save-img"]').on('click', () =>
    //hacer que guarde imagen wjajajajaj x gusto
    downloadCanvas('card-info', 'imagen.png'))

  $('#listTable tbody')
    .on('click', 'a[rel="delete"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', data.id)
      submit_with_ajax_alert(location.pathname, 'Delete!',
        'Are you sure you want to delete the product <b>' + data.full_name + '</b>?',
        parameters,
        response => {
          tableSale.row($(this).parents('tr')).remove().draw()
          Toast(`The ${ent} ${response['object']['full_name']} was ${response['success']}`)
        },
        'mdi mdi-alert-octagram text-danger')
    })
    .on('click', 'a[rel="update"]', function () {
      $('#myModalForm').trigger('reset')
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data()
      console.log(data)
      document.querySelector('#id_name').value = data['name']
      document.querySelector('#id_stock').value = data['stock']
      document.querySelector('#id_s_price').value = data['s_price']
      document.querySelector('#id_cat').attributes[6].ownerElement.value =
        data['cat']['id']
      document.querySelector('button[data-id="id_cat"] div div div').innerHTML =
        data['cat']['name']
      let ext = data['image'].substr(data['image'].lastIndexOf('.')),
        nombre = data['image'].substring(26, data['image'].lastIndexOf('.'))
      document.querySelector('#image_span').innerHTML =
        nombre.length < 30 ? nombre + ext : truncate(nombre, 30) + ext

      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = data['id']
      $('#myModal').modal('show')
    })
    .on('click', 'a[rel="detail"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data()
      $('#myModalDetail .modal-body').html(`
          <div class="card circular bg-light" id="card-info">
              <img class="card-img-top img-fluid circular" src="${data['image']}" alt="Card image cap">
              <div class="card-body circular">
                  <h5 class="card-title"><b>${data['full_name']}</b></h5>
                  <br>
                  <span class="card-text"><b>Selling price: </b>$ ${data['s_price']}</span>
                  <br>
                  <span class="card-text"><b>Stock: </b>${data['stock']}</span>
              </div>
          </div>`)
      $('#myModalDetail').modal('show')
    })
})

let
  downloadCanvas = function (canvasId, filename) {
    // Obteniendo la etiqueta la cual se desea convertir en imagen
    const domElement = document.getElementById(canvasId);

    // Utilizando la función html2canvas para hacer la conversión
    html2canvas(domElement, {
      onrendered: function (domElementCanvas) {
        // Obteniendo el contexto del canvas ya generado
        const context = domElementCanvas.getContext('2d');

        // Creando enlace para descargar la imagen generada
        let link = document.createElement('a');
        link.href = domElementCanvas.toDataURL("image/png");
        link.download = filename;

        // Simulando clic para descargar
        link.click();
      }
    })
  },

  listar = function () {
    tableSale = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      responsive: true,
      destroy: true,
      buttons: buttonsDataTable(),
      dom: '<"row"<"col-sm-5"B><"col-sm-7"fr>>t<"row"<"col-sm-5"i><"col-sm-7"p>>',
      colReorder: true,
      // fixedHeader: {
      //   header: true,
      //   headerOffset: 1
      // },
      searching: true,
      // pagingType: "full_numbers",
      // pageLength: 8,
      // lengthMenu: [[5, 8, 15, 20], [5, 8, 15, 20]],
      // oLanguage: {
      //   sLengthMenu: ""
      // },
      // dom: "<'row'<'col-sm-12'tr>>" +
      //   "<'row'<'col-sm-6'i><'col-sm-6'p>>",
      deferRender: true,
      ajax: {
        url: location.pathname,
        type: 'POST',
        data: {
          'action': 'searchdata'
        },
        dataSrc: ""
      },
      columns: [
        {'data': 'stock'},
        {'data': 'name'},
        {'data': 'cat.name'},
        {'data': 'image'},
        {'data': 's_price'},
        {'data': 'id'},
      ],
      columnDefs: [
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: () => `
              <a rel="detail" class="btn bg-gradient-teal btn-xs circular-circle">
                  <i class="mdi mdi-image-search mdi-15px w3-text-black"></i></a>
              <a rel="update" class="btn bg-gradient-warning btn-xs circular-circle mx-1">
                  <i class="mdi mdi-square-edit-outline mdi-15px"></i></a>
              <a rel="delete" class="btn bg-gradient-danger btn-xs circular-circle">
                  <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
        },
        {
          targets: [-2],
          orderable: true,
          class: 'text-center',
          render: (data, type, row) => `$ ${parseFloat(data).toFixed(2)}`
        },
        {
          targets: [-3],
          orderable: false,
          class: 'text-center',
          render: data =>
            `<img src="${data}" class="img-fluid d-block mx-auto"
             style="width: 25px; height: 25px;">`
        },
        {
          targets: [0],
          orderable: true,
          class: 'text-center',
          render: data =>
            `<span class="badge rounded-pill badge-${data ? 'success' : 'danger'}">${data}</span>`
        }
      ],
      drawCallback: () =>
        $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
      ,
      initComplete: (settings, json) => {
        $('input[type=search]').focus()
        // $('#searchInput').focus()
        setHeightTable()
      },
    })
  },
  callbackCreate = data =>
    Toast(`${ent}: ${data['object']['full_name']} ${data['success']} successfully`)
  ,
  callbackUpdate = data => callbackCreate(data)
  ,
  formStyles = () => {
    document.querySelector('#id_image').style.display = 'none'
    document.querySelector('#id_image').parentElement.innerHTML += `
      <div class="form-control circular" style="overflow: hidden">
          <label for="id_image" id="image_label" class="btn bg-gradient-indigo text-nowrap circular-left">
              <i class="mdi mdi-image-plus"></i> Upload a image
          </label>
          <span id="image_span">Nothing selected yet</span>
      </div>`

    document.querySelector('#id_image').addEventListener('change', () => {
      // console.log(document.querySelector('#id_image').attributes)
      let ext = document.querySelector('#id_image').files[0].name
          .substr(document.querySelector('#id_image').files[0].name.lastIndexOf('.')),
        nombre = document.querySelector('#id_image').files[0].name
          .substring(0, document.querySelector('#id_image').files[0].name.lastIndexOf('.'))

      document.querySelector('#image_span').innerHTML =
        nombre.length < 30 ? nombre + ext : truncate(nombre, 30) + ext
    })
  }

