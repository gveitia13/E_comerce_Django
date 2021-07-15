let
  listTableProduct,
  listTable,
  Sale = {
    items: {
      cli: '',
      date_joined: '',
      subtotal: 0.00,
      iva: 0.00,
      total: 0.00,
      products: []
    },
    get_ids: function () {
      let ids = []
      this.items.products.forEach(value => {
        ids.push(value.id)
      })
      return ids
    },
    calculate_invoice: function () {
      let subtotal = 0.00,
        iva = $('input[name="iva"]').val()
      this.items.products.forEach(e => {
        e.subtotal = e.cant * parseFloat(e.s_price)
        subtotal += e.subtotal
      })
      this.items.subtotal = subtotal
      this.items.iva = this.items.subtotal * iva
      this.items.total = this.items.subtotal + this.items.iva

      $('input[name="subtotal"]').val(this.items.subtotal.toFixed(2))
      $('input[name="ivacalc"]').val(this.items.iva.toFixed(2))
      $('input[name="total"]').val(this.items.total.toFixed(2))
    },
    add: function (item) {
      Sale.items.products.push(item)
      Sale.list()
    },
    list: function () {
      this.calculate_invoice()
      // document.getElementById('tbody').innerHTML = ``
      // this.items.products.forEach(e => {
      //   createTableSale(e)
      // })
      listTableProduct = $ ('#listTableProduct')
    },
  }

$(function () {
  $('.select2').select2({
    theme: "bootstrap4",
    language: 'es'
  })

  $("input[name='iva']").TouchSpin({
    min: 0,
    max: Number.POSITIVE_INFINITY,
    boostat: 5,
    maxboostedstep: 10,
    step: 0.01,
    decimals: 2,
    buttondown_class: 'btn bg-gradient-secondary',
    buttonup_class: 'btn bg-gradient-secondary'
  }).on('change', function () {
    if (parseFloat(this.value) === 0) {
      this.parentElement.children[0].children[0].classList.remove('bg-gradient-secondary')
      this.parentElement.children[0].children[0].classList.add('bg-gradient-danger')
      this.classList.add('w3-text-red')
    }
    if (parseFloat(this.value) !== 0) {
      this.parentElement.children[0].children[0].classList.remove('bg-gradient-danger')
      this.parentElement.children[0].children[0].classList.add('bg-gradient-secondary')
      this.classList.remove('w3-text-red')
    }
    Sale.calculate_invoice()
  })

  $('#id_date_joined').datepicker({
    todayHighlight: true,
    autoclose: true,
    format: 'yyyy-mm-dd',
    endDate: 'today',
    clearBtn: true,
    startDate: '1920-1-1',
  })

  $('#id_date_birthday').datepicker({
    todayHighlight: true,
    autoclose: true,
    format: 'yyyy-mm-dd',
    endDate: 'today',
    clearBtn: true,
    startDate: '1920-1-1',
  })

  $('#myModalSearchProducts').on('shown.bs.modal', function () {
    $('input[name="table_search"]').focus();

  })

  $('.btnAddClient').on('click', function () {
    $('#myModalClient').modal('show');
    $('#myModalFormClient').trigger('reset');
  })

  $('#btnSearchProduct').on('click', function () {
    $('#myModalSearchProducts').modal('show');
    let parameters = new FormData()
    parameters.append('action', 'list_products')
    ajaxFunction(location.pathname, parameters, (data) => {
      createTableProd(data)
    })
  })

  $('div.card-footer button').eq(1).on('click', () => {
    if (Sale.items.products.length === 0) return false
    alert_action('Clean up',
      'Do you want to delete the products from the table?',
      () => {
        Sale.items.products = []
        Sale.list()
      }, () => {
      }, 'mdi mdi-trash-can-outline')
  })

  $('#myModalFormClient').on('submit', function (e) {
    e.preventDefault()
    let parameters = new FormData(this)
    parameters.append('action', 'create_client')
    submit_with_ajax(location.pathname, parameters, (data) => {
      let newOption = new Option(data['full_name'], data['id'], false, true)
      $('select[name="cli"]').append(newOption).trigger('change')
      $('#myModalClient').modal('hide')
      Toast(`Client: ${data['name']} has been added to the database`)
    })
  })

})

let
  createTrProd = (product, stock, image, s_price, id) => {
    return `
      <tr class="item">
          <td style="width: 35%;">${product}</td>
          <td style="width: 15%;" class="w3-center">
              <span class="badge badge-secondary">${stock}</span></td>
          <td style="width: 15%;" class="w3-center">
              <img src="${image}" class="img-fluid d-block mx-auto"
                   style="width: 20px; height: 20px;">
          </td>
          <td style="width: 20%;" class="w3-center">$ ${parseFloat(s_price).toFixed(2)}</td>
          <td class="w3-center" style="width: 15%;">
              <button name="tbl_prod_${id}" type="button"
                      class="btn bg-gradient-success btn-xs btnAddProduct"><i
                      class="mdi mdi-plus mdi-15px w3-text-black"></i></button>
          </td>
      </tr>
            `
  },

  createTrSale = (product, stock, s_price, id) => {
    return `
      <tr class="item">
          <td class="text-center">
              <button name="tbl_sale_${id}" class="btn bg-gradient-danger btn-xs btnTrash" type="button">
                  <i class="mdi mdi-trash-can-outline mdi-15px"></i></button>
          </td>
          <td>${product}</td>
          <td class="text-center"><span class="badge badge-secondary">${stock}</span></td>
          <td class="text-center">$ ${s_price}</td>
          <td class="text-center">
              <input type="text" name="cant_${id}"
                     class="form-control form-control-sm input-sm text-center"
                     autocomplete="off"
                     value="1">
          </td>
          <td class="text-center" id="subtotal_${id}">$ ${s_price}</td>
      </tr>
            `
  },

  createTableProd = data => {

    document.getElementById('tbodyProduct').innerHTML = ``
    for (const item of data)
      document.getElementById('tbodyProduct').innerHTML +=
        createTrProd(item['full_name'], item['stock'], item['image'], item['s_price'], item['id'])

    $('.btnAddProduct').on({
      click: function () {
        let parameters = new FormData(),
          id = this.name.replace('tbl_prod_', '')
        parameters.append('action', 'get_product_by_id')
        parameters.append('id', id)
        ajaxFunction(location.pathname, parameters, data => {
          Sale.add(data)
          Sale.list()
          // createTableSale(data)
          removeTr(`tbl_prod_${data['id']}`)
        })
      },
    })
  },

  createTableSale = data => {

    document.getElementById('tbody').innerHTML +=
      createTrSale(data['full_name'], data['stock'], data['s_price'], data['id'])
    eventTrSale(data['id'], data['stock'])
  },

  removeTr = id => {
    document.querySelector(`button[name="${id}"]`).parentElement.parentElement.remove()
  },

  eventTrSale = (id, max) => {
    console.log(id)
    $(`input[name='cant_${id}']`).TouchSpin({
      min: 1,
      max: max,
      step: 1,
      buttondown_class: 'btn bg-gradient-secondary',
      buttonup_class: 'btn bg-gradient-secondary',
    })
  }