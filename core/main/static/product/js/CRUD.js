$(function () {
  //Set active class to Product path
  if (window.location.pathname.includes('product')) {
    changeSidebar('.my-stored', '.my-stored-prod')
  }
  //Event btn Add
  $('.btnAdd').on('click', function () {
    $('#myModal').modal('show');
    $('#myModalForm').trigger('reset');
    document.querySelector('#image_span').innerHTML = 'Nothing selected yet'
    document.querySelector('#select2-id_cat-container').innerHTML = '---------'
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
  })
  formStyles()

  $('.select2').select2({
    theme: "bootstrap4",
    language: 'es',
  })

  $("input[name='stock']").TouchSpin({
    min: 0,
    max: 999999999999,
    step: 1,
    boostat: 5,
    maxboostedstep: 10,
    buttondown_class: 'btn bg-gradient-info',
    buttonup_class: 'btn bg-gradient-success',
    postfix: '#',
  })

  $("input[name='s_price']").TouchSpin({
    min: 0,
    max: 999999999999,
    boostat: 5,
    maxboostedstep: 10,
    prefix: `$`,
    step: 0.01,
    decimals: 2,
    buttondown_class: 'btn bg-gradient-info',
    buttonup_class: 'btn bg-gradient-success'
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
      $('#myModal').modal('show')
      $('#myModalForm').trigger('reset')
      let parameters = new FormData()
      parameters.append('action', 'search_product')
      parameters.append('id', this.name)
      ajaxFunction(window.location.pathname, parameters, (data) => {
        document.querySelector('#id_name').value = data['object']['name']
        document.querySelector('#id_stock').value = data['object']['stock']
        document.querySelector('#id_s_price').value = data['object']['s_price']
        document.querySelector('#id_cat').attributes[6].ownerElement.value = data['object']['cat']['id']
        document.querySelector('#select2-id_cat-container').innerHTML = data['object']['cat']['name']
      })

      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = this.name
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
// buscar clientes
/*
$('select[name="cli"]').select2({
  theme: "bootstrap4",
  language: 'es',
  allowClear: true,
  ajax: {
    delay: 250,
    type: 'POST',
    url: window.location.pathname,
    data: (params) => {
      return {
        term: params.term,
        action: 'search_clients'
      };
    },
    processResults: (data) => {
      return {
        results: data
      }
    },
  },
  placeholder: 'Ingrese un nombre',
  minimumInputLength: 1,
});*/
