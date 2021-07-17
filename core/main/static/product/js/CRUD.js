$(function () {
  //Set active class to Product path
  if (window.location.pathname.includes('product')) {
    changeSidebar('.my-stored', '.my-stored-prod')
  }
  //Event btn Add
  $('.btnAdd').on('click', function () {
    document.querySelector('#image_span').innerHTML = 'Nothing selected yet'
    document.querySelector('button[data-id="id_cat"] div div div').innerHTML = '---------'
    document.querySelector('#id_cat').attributes[6].ownerElement.value = ''
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
    $('#myModalForm').trigger('reset');
    $('#myModal').modal('show');
  })

  formStyles()

  $('.select2').select2({
    theme: "bootstrap4",
    language: 'es',
  })
  $('.selectpicker').selectpicker('render')

  $("input[name='stock']").TouchSpin({
    min: 0,
    max: 999999999999,
    step: 1,
    boostat: 5,
    maxboostedstep: 10,
    buttondown_class: 'btn bg-gradient-primary',
    buttonup_class: 'btn bg-gradient-primary',
    postfix: '#',
  }).on('change', function () {
    if (this.value === '0') {
      document.querySelector('.bootstrap-touchspin-down').classList.remove('bg-gradient-primary')
      document.querySelector('.bootstrap-touchspin-down').classList.add('bg-gradient-danger')
      this.classList.add('w3-text-red')
    }
    if (this.value !== '0') {
      document.querySelector('.bootstrap-touchspin-down').classList.remove('bg-gradient-danger')
      document.querySelector('.bootstrap-touchspin-down').classList.add('bg-gradient-primary')
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
    buttondown_class: 'btn bg-gradient-primary',
    buttonup_class: 'btn bg-gradient-primary'
  }).on('change', function () {
    if (parseFloat(this.value) === 0) {
      document.querySelectorAll('.bootstrap-touchspin-down')[1].classList.remove('bg-gradient-primary')
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
    $('#myModalDetail').modal('hide');
  })

  $('#myModalDetail div.modal-footer button:first').on('click', function () {
    //hacer que guarde imagen wjajajajaj x gusto
  })

  btnEvents()

})

let
  btnEvents = function () {
    //Event btn Delete Product
    $('.btnTrash').on('click', function () {
      let parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', this.name)
      idToDelete.id = this.name
      console.log(document.querySelector(`button[name="${idToDelete.id}"]`).name)

      let prod_name = this.parentNode.parentNode.children[1].innerText
      submit_with_ajax_alert(window.location.pathname, 'Delete',
        `Are you sure you want to delete the ${ent}:<b> ${prod_name}</b> record?`,
        parameters,
        (data) => {
          document.querySelector(`button[name="${idToDelete.id}"]`).parentElement.parentElement.remove()
          Toast(`${data['object']['full_name']} ${data['success']} successfully`)
        },
        'mdi mdi-alert-octagram text-danger'
      )
    })

    //Event btn Update Product
    $('.btnUpdate').on('click', function () {
      $('#myModalForm').trigger('reset')
      let parameters = new FormData()
      parameters.append('action', 'search_product')
      parameters.append('id', this.name)
      ajaxFunction(window.location.pathname, parameters, (data) => {
        document.querySelector('#id_name').value = data['object']['name']
        document.querySelector('#id_stock').value = data['object']['stock']
        document.querySelector('#id_s_price').value = data['object']['s_price']
        document.querySelector('#id_cat').attributes[6].ownerElement.value =
          data['object']['cat']['id']
        document.querySelector('button[data-id="id_cat"] div div div').innerHTML =
          data['object']['cat']['name']
      })
      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = this.name
      $('#myModal').modal('show')
    })

    //Event btn Contact Client
    $('.btnDetail').on('click', function () {
      let parameters = new FormData()
      parameters.append('action', 'search_product')
      parameters.append('id', this.name)
      ajaxFunction(location.pathname, parameters, data => {
        $('#myModalDetail .modal-body').html(`
          <div class="card">
              <img class="card-img-top img-fluid" src="${data['object']['image']}" alt="Card image cap">
              <div class="card-body">
                  <h5 class="card-title"><b>${data['object']['full_name']}</b></h5>
                  <br>
                  <span class="card-text"><b>Selling price: </b>$ ${data['object']['s_price']}</span>
                  <br>
                  <span class="card-text"><b>Stock: </b>${data['object']['stock']}</span>
              </div>
          </div>`)
      })
      $('#myModalDetail').modal('show')
    })
  },

  callbackCreate = data => {
    document.getElementById('tbody').innerHTML +=
      createTr(data['object']['id'], data['object']['stock'], data['object']['name'],
        data['object']['cat']['name'], data['object']['image'], data['object']['s_price'])
    document.getElementById('sort-by-name').click()
    document.getElementById('sort-by-name').click()
    Toast(`${ent}: ${data['object']['full_name']} ${data['success']} successfully`)
    btnEvents()
  },

  callbackUpdate = function (data) {
    document.querySelector(`button[name="${idToEdit.id}"]`).parentElement.parentElement.remove()
    callbackCreate(data)
  },

  createTr = (id, stock, name, cat_name, image, s_price) => {
    let span = `danger`
    if (stock > 0) span = `success`
    console.log(image)
    return `<tr class="item">
            <td style="width: 10%;" class="w3-center">
                    <span class="badge badge-${span}">${stock}</span></td>
            <td style="width: 20%;">${name}</td>
            <td id="name_${id}" style="width: 20%;">${cat_name}</td>
            <td style="width: 15%;"><img src="${image}" class="img-fluid d-block mx-auto"
             style="width: 20px; height: 20px;"></td>
            <td style="width: 15%;" class="w3-center">$ ${parseFloat(s_price).toFixed(2)}</td>

            <td class="w3-center" style="width: 20%;">
                <button name="${id}"
                        class="btn bg-gradient-teal btn-xs btnDetail"><i
                        class="mdi mdi-magnify-plus mdi-15px w3-text-black"></i></button>
                <button name="${id}"
                        class="btn bg-gradient-warning btn-xs btnUpdate"><i
                        class="mdi mdi-square-edit-outline mdi-15px"></i></button>
                <button name="${id}"
                        class="btn bg-gradient-danger btn-xs btnTrash"><i
                        class="mdi mdi-trash-can-outline mdi-15px"></i></button>
            </td>
        </tr>`
  },

  formStyles = () => {
    document.querySelector('#id_image').style.display = 'none'
    document.querySelector('#id_image').parentElement.innerHTML += `
      <div class="form-control" style="overflow: hidden">
          <label for="id_image" id="image_label" class="btn bg-gradient-primary text-nowrap">
              <i class="mdi mdi-image-plus"></i> Upload a image
          </label>
          <span id="image_span">Nothing selected yet</span>
      </div>`

    document.querySelector('#id_image').addEventListener('change', function () {
      document.querySelector('#image_span').innerHTML =
        document.querySelector('#id_image').files[0].name

      console.log(document.querySelector('#id_image').attributes)
    })
  }

